import os
import base64
import tempfile
import re
import shutil
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from dotenv import load_dotenv
import uvicorn

# Import services (đảm bảo cấu trúc thư mục đúng)
from speech_recognition.vosk_service import VoskService
from speech_synthesis.tts_service import TTSService

# Load environment variables
load_dotenv()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏗️ GLOBAL STATE & LIFESPAN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

services: Dict[str, Any] = {}

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
        
        # Check initial readiness
        if not services["vosk"].is_ready():
             logger.warning("⚠️ Vosk model is not ready yet.")
        
        logger.success("✅ All services initialized successfully")
    except Exception as e:
        logger.critical(f"❌ Failed to initialize services: {e}")
        # Không raise e ở đây để app vẫn chạy và trả về lỗi ở healthcheck
        # Tuy nhiên, trong production có thể muốn fail fast.
        
    yield
    
    # Cleanup (if needed)
    services.clear()
    logger.info("🛑 Shutting down Speech Service...")

app = FastAPI(
    title="English Learning Speech API",
    description="Microservice for STT (Vosk) & TTS (gTTS + MinIO)",
    version="2.2.0",
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
        "service": "Speech API v2.2",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Check connections to MinIO and Model status."""
    vosk_ready = services.get("vosk") and services["vosk"].is_ready()
    # Giả sử TTSService có hàm check_connection, nếu không có thể bỏ qua hoặc wrap try-catch
    minio_status = "unknown"
    if services.get("tts"):
        try:
            # Nếu TTSService có hàm check_minio_connection
            if hasattr(services["tts"], "check_minio_connection"):
                 minio_status = services["tts"].check_minio_connection()
            else:
                 minio_status = "connected (assumed)"
        except Exception as e:
            minio_status = f"error: {str(e)}"

    return {
        "status": "healthy" if vosk_ready else "degraded",
        "components": {
            "vosk_model": vosk_ready,
            "minio": minio_status,
        }
    }

@app.post("/stt/recognize-base64", response_model=STTResponse)
async def recognize_speech_base64(request: STTRequest):
    """
    Decodes Base64 audio -> converts to WAV -> returns recognized text & correctness.
    """
    tmp_path = None
    try:
        logger.info(f"🎤 STT Request (Vocab {request.vocab_id}): Target='{request.target_word}'")

        if not services.get("vosk"):
             raise HTTPException(status_code=503, detail="Vosk service not initialized")

        # 1. Write Base64 to Temp File
        try:
            audio_bytes = base64.b64decode(request.audio_base64)
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid base64 audio data")
             
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # 2. Recognize
        result = services["vosk"].recognize(tmp_path)
        
        if 'error' in result and result['error']:
             logger.error(f"Vosk recognition error: {result['error']}")
             raise Exception(result['error'])

        # 3. Compare
        rec_text_raw = result.get('text', '')
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ STT Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass

@app.post("/stt/recognize-file", response_model=STTResponse)
async def recognize_speech_file(
    file: UploadFile = File(...),
    target_word: str = Form(...),
    vocab_id: int = Form(...),
    user_id: int = Form(...)
):
    """
    Accepts audio file upload (multipart/form-data) -> returns recognized text.
    Alternative endpoint if base64 is too heavy.
    """
    tmp_path = None
    try:
        logger.info(f"🎤 STT File Request (Vocab {vocab_id}): Target='{target_word}'")
        
        if not services.get("vosk"):
             raise HTTPException(status_code=503, detail="Vosk service not initialized")

        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Recognize
        result = services["vosk"].recognize(tmp_path)
        
        if 'error' in result and result['error']:
             raise Exception(result['error'])

        rec_text_raw = result.get('text', '')
        normalized_rec = normalize_text(rec_text_raw)
        normalized_target = normalize_text(target_word)
        is_correct = (normalized_rec == normalized_target)

        return STTResponse(
            recognized_text=rec_text_raw,
            target_word=target_word,
            is_correct=is_correct,
            confidence=result.get('confidence', 0.0)
        )

    except Exception as e:
        logger.error(f"❌ STT File Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass

@app.post("/tts/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generates or retrieves cached TTS audio URL.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        if not services.get("tts"):
             raise HTTPException(status_code=503, detail="TTS service not initialized")

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
    if not services.get("tts"):
         raise HTTPException(status_code=503, detail="TTS service not initialized")
         
    deleted = services["tts"].delete_audio(vocab_id, language)
    if not deleted:
        return {"status": "failed", "message": "File not found or error occurred"}
    return {"status": "success", "message": "Audio deleted"}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 ENTRY POINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    # Reload nên được tắt trong production
    reload = os.getenv("ENV", "dev") == "dev"
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info"
    )