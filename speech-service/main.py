from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import base64
import re
from loguru import logger
from dotenv import load_dotenv

from speech_recognition.vosk_service import VoskService
from speech_synthesis.tts_service import TTSService

load_dotenv()

app = FastAPI(
    title="English Learning Speech API",
    description="Simple STT (text match) & TTS Service",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vosk_service = VoskService()
tts_service = TTSService()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REQUEST/RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TTSGenerateRequest(BaseModel):
    text: str
    lang: str = "en"
    vocab_id: int
    slow: bool = False

class TTSGenerateResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
    cached: bool = False

class STTRecognizeBase64Request(BaseModel):
    audio_base64: str
    target_word: str
    user_id: int
    vocab_id: int
    save_recording: bool = False

class STTRecognizeResponse(BaseModel):
    recognized_text: str
    target_word: str
    is_correct: bool
    confidence: float

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPER FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def normalize_text(text: str) -> str:
    """
    Normalize text for comparison
    - Convert to lowercase
    - Remove punctuation
    - Remove extra whitespace
    """
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)
    text = ' '.join(text.split())
    return text

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROOT & HEALTH CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def root():
    return {
        "message": "✅ Speech API v2.0 is running",
        "endpoints": {
            "tts": "POST /tts/generate - Generate TTS audio",
            "stt": "POST /stt/recognize-base64 - Simple text matching",
            "health": "GET /health - Health check"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "services": {
            "vosk_model": vosk_service.is_ready(),
            "tts_service": "ready",
            "minio_connected": tts_service.check_minio_connection(),
        },
        "features": {
            "stt": "Simple text matching (normalized)",
            "tts": "gTTS with MinIO caching",
            "scoring": "Exact match only (true/false)"
        }
    }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ STT ENDPOINT - SIMPLE TEXT MATCH ONLY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/stt/recognize-base64", response_model=STTRecognizeResponse)
async def recognize_speech_base64(request: STTRecognizeBase64Request):
    """
    ✅ SIMPLE: Recognize speech and compare text
    
    Flow:
    1. Decode base64 audio
    2. Vosk recognize speech → text
    3. Normalize both recognized and target text
    4. Compare: recognized == target
    5. Return: is_correct (true/false)
    
    Same as other question types (MCQ, fill-in-blank)
    """
    try:
        logger.info(
            f"🎤 STT Request - Vocab {request.vocab_id}: '{request.target_word}'"
        )

        # 1. Decode base64 to file
        audio_data = base64.b64decode(request.audio_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name

        # 2. Recognize speech with Vosk
        vosk_result = vosk_service.recognize(tmp_path)
        recognized_raw = vosk_result['text'].strip()
        confidence = vosk_result.get('confidence', 0.0)
        
        logger.info(f"📝 Vosk output: '{recognized_raw}' (confidence: {confidence:.3f})")

        # 3. ✅ NORMALIZE and COMPARE
        recognized = normalize_text(recognized_raw)
        target = normalize_text(request.target_word)
        
        # Simple exact match
        is_correct = (recognized == target)
        
        logger.info(
            f"✅ Result: '{recognized}' vs '{target}' → "
            f"{'CORRECT ✓' if is_correct else 'WRONG ✗'}"
        )

        # 4. Cleanup
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

        # 5. ✅ RETURN SIMPLE RESPONSE
        return STTRecognizeResponse(
            recognized_text=recognized_raw,  # Original for display
            target_word=request.target_word,
            is_correct=is_correct,
            confidence=confidence
        )

    except Exception as e:
        logger.error(f"❌ STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TTS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/tts/generate", response_model=TTSGenerateResponse)
async def generate_tts(request: TTSGenerateRequest):
    """
    ✅ Generate TTS audio and upload to MinIO
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        logger.info(f"🔊 TTS for vocab {request.vocab_id}: '{request.text}'")

        result = tts_service.synthesize(
            text=request.text,
            lang=request.lang,
            vocab_id=request.vocab_id,
            slow=request.slow
        )

        return TTSGenerateResponse(
            audio_url=result['audio_url'],
            duration=result.get('duration'),
            cached=result.get('cached', False)
        )

    except Exception as e:
        logger.error(f"❌ TTS failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.get("/tts/voices")
async def get_voices(language: Optional[str] = None):
    """Get available TTS voices"""
    voices = [
        {"code": "en", "name": "English (US)", "language": "en"},
        {"code": "vi", "name": "Vietnamese", "language": "vi"},
    ]

    if language:
        voices = [v for v in voices if v['language'] == language]

    return {"voices": voices}

@app.delete("/tts/audio/{vocab_id}")
async def delete_audio(vocab_id: int, language: str = "en"):
    """Delete audio file from MinIO"""
    try:
        result = tts_service.delete_audio(vocab_id, language)
        return {"message": "Audio deleted successfully", "deleted": result}
    except Exception as e:
        logger.warning(f"⚠️ Delete audio failed: {str(e)}")
        return {"message": "Audio deletion failed", "error": str(e)}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RUN SERVER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )