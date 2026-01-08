import os
import base64
import tempfile
import re
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from dotenv import load_dotenv
import uvicorn

from speech_recognition.vosk_service import VoskService
from speech_synthesis.tts_service import TTSService

# Load env vars
load_dotenv()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏗️ GLOBAL STATE & LIFESPAN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage startup and shutdown events.
    Initializes AI models only when server starts.
    """
    logger.info("🚀 Starting Speech Service...")
    
    # Initialize Services
    try:
        services["vosk"] = VoskService()
        services["tts"] = TTSService()
        logger.success("✅ All services initialized successfully")
    except Exception as e:
        logger.critical(f"❌ Failed to initialize services: {e}")
        raise e
        
    yield
    
    # Cleanup (if needed)
    services.clear()
    logger.info("🛑 Shutting down Speech Service...")

app = FastAPI(
    title="English Learning Speech API",
    description="Microservice for STT (Vosk) & TTS (gTTS + MinIO)",
    version="2.1.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 DTO MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TTSRequest(BaseModel):
    text: str
    vocab_id: int
    lang: str = "en"
    slow: bool = False

class TTSResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
    cached: bool = False

class STTRequest(BaseModel):
    audio_base64: str
    target_word: str
    user_id: int
    vocab_id: int
    save_recording: bool = False

class STTResponse(BaseModel):
    recognized_text: str
    target_word: str
    is_correct: bool
    confidence: float

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🛠️ HELPER FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def normalize_text(text: str) -> str:
    """Normalize text: lowercase, remove punctuation & extra spaces."""
    if not text: return ""
    text = re.sub(r'[^\w\s]', '', text.lower().strip())
    return ' '.join(text.split())

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🌐 API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def root():
    return {
        "status": "online", 
        "service": "Speech API v2.1",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Check connections to MinIO and Model status."""
    return {
        "status": "healthy",
        "components": {
            "vosk_model": services["vosk"].is_ready(),
            "minio": services["tts"].check_minio_connection(),
        }
    }

@app.post("/stt/recognize-base64", response_model=STTResponse)
async def recognize_speech(request: STTRequest):
    """
    Decodes Base64 audio -> converts to WAV -> returns recognized text & correctness.
    """
    tmp_path = None
    try:
        logger.info(f"🎤 STT Request (Vocab {request.vocab_id}): Target='{request.target_word}'")

        # 1. Write Base64 to Temp File
        audio_bytes = base64.b64decode(request.audio_base64)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # 2. Recognize
        result = services["vosk"].recognize(tmp_path)
        
        if 'error' in result and result['error']:
             raise Exception(result['error'])

        # 3. Compare
        rec_text_raw = result['text']
        normalized_rec = normalize_text(rec_text_raw)
        normalized_target = normalize_text(request.target_word)
        
        is_correct = (normalized_rec == normalized_target)

        logger.info(f"✅ Comparison: '{normalized_rec}' vs '{normalized_target}' => {is_correct}")

        return STTResponse(
            recognized_text=rec_text_raw,
            target_word=request.target_word,
            is_correct=is_correct,
            confidence=result.get('confidence', 0.0)
        )

    except Exception as e:
        logger.error(f"❌ STT Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/tts/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generates or retrieves cached TTS audio URL.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        result = services["tts"].synthesize(
            text=request.text,
            lang=request.lang,
            vocab_id=request.vocab_id,
            slow=request.slow
        )
        return TTSResponse(**result)

    except Exception as e:
        logger.error(f"❌ TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tts/voices")
async def get_voices(language: Optional[str] = None):
    voices = [
        {"code": "en", "name": "English (US)", "language": "en"},
        {"code": "vi", "name": "Vietnamese", "language": "vi"},
    ]
    if language:
        voices = [v for v in voices if v['language'] == language]
    return {"voices": voices}

@app.delete("/tts/audio/{vocab_id}")
async def delete_audio(vocab_id: int, language: str = "en"):
    deleted = services["tts"].delete_audio(vocab_id, language)
    if not deleted:
        return {"status": "failed", "message": "File not found or error occurred"}
    return {"status": "success", "message": "Audio deleted"}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 ENTRY POINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )