from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import uuid
import base64
from loguru import logger
from dotenv import load_dotenv

from speech_recognition.vosk_service import VoskService
from speech_synthesis.tts_service import TTSService

load_dotenv()

app = FastAPI(
    title="English Learning Speech API",
    description="Speech Recognition & Text-to-Speech Service",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vosk_service = VoskService()
tts_service = TTSService()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ REQUEST/RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TTSGenerateRequest(BaseModel):
    text: str
    lang: str = "en"
    vocab_id: int
    slow: bool = False

class STTRecognizeBase64Request(BaseModel):
    audio_base64: str
    target_word: str
    user_id: int
    vocab_id: int
    save_recording: bool = False

class PronunciationScore(BaseModel):
    accuracy: float
    fluency: float
    completeness: float

class STTRecognizeResponse(BaseModel):
    recognized_text: str
    target_word: str
    is_correct: bool
    confidence: float
    accuracy: float
    pronunciation_score: Optional[PronunciationScore] = None
    audio_url: Optional[str] = None

class TTSGenerateResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
    cached: bool = False

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def root():
    return {
        "message": "✅ Speech API v2.0 is running",
        "endpoints": {
            "tts": "POST /tts/generate - Generate TTS audio",
            "stt": "POST /stt/recognize-base64 - Recognize speech from base64",
            "health": "GET /health - Health check"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "vosk_model_loaded": vosk_service.is_ready(),
        "tts_service": "ready",
        "minio_connected": tts_service.check_minio_connection()
    }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ TTS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/tts/generate", response_model=TTSGenerateResponse)
async def generate_tts(request: TTSGenerateRequest):
    """
    ✅ Generate TTS audio and upload to MinIO
    Returns MinIO URL
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        logger.info(f"🔊 Generating TTS for vocab {request.vocab_id}: '{request.text}'")

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
        logger.error(f"❌ TTS generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.get("/tts/voices")
async def get_voices(language: Optional[str] = None):
    """
    ✅ Get available TTS voices
    """
    # For gTTS, voices are language-based
    voices = [
        {"code": "en", "name": "English (US)", "language": "en"},
        {"code": "vi", "name": "Vietnamese", "language": "vi"},
    ]

    if language:
        voices = [v for v in voices if v['language'] == language]

    return {"voices": voices}

@app.delete("/tts/audio/{vocab_id}")
async def delete_audio(vocab_id: int, language: str = "en"):
    """
    ✅ Delete audio file from MinIO
    """
    try:
        result = tts_service.delete_audio(vocab_id, language)
        return {"message": "Audio deleted successfully", "deleted": result}
    except Exception as e:
        logger.warning(f"⚠️ Delete audio failed: {str(e)}")
        return {"message": "Audio deletion failed", "error": str(e)}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ STT ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/stt/recognize-base64", response_model=STTRecognizeResponse)
async def recognize_speech_base64(request: STTRecognizeBase64Request):
    """
    ✅ Recognize speech from base64 audio
    Compares with target word and returns accuracy
    """
    try:
        logger.info(f"🎤 Recognizing speech for vocab {request.vocab_id}, target: '{request.target_word}'")

        # Decode base64 to file
        audio_data = base64.b64decode(request.audio_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name

        # Recognize speech
        result = vosk_service.recognize(tmp_path)
        recognized_text = result['text'].strip().lower()
        target_word = request.target_word.strip().lower()

        # Compare with target word
        is_correct = recognized_text == target_word
        confidence = result.get('confidence', 0.0)

        # Calculate pronunciation score
        accuracy = calculate_pronunciation_accuracy(recognized_text, target_word)
        pronunciation_score = PronunciationScore(
            accuracy=accuracy,
            fluency=confidence * 100,
            completeness=100 if is_correct else accuracy
        )

        # Optionally save recording
        audio_url = None
        if request.save_recording:
            audio_url = save_user_recording(
                tmp_path,
                request.user_id,
                request.vocab_id
            )

        # Cleanup
        try:
            os.unlink(tmp_path)
        except:
            pass

        logger.info(f"✅ Recognized: '{recognized_text}' (correct: {is_correct}, confidence: {confidence:.2f})")

        return STTRecognizeResponse(
            recognized_text=recognized_text,
            target_word=target_word,
            is_correct=is_correct,
            confidence=confidence,
            accuracy=accuracy,
            pronunciation_score=pronunciation_score,
            audio_url=audio_url
        )

    except Exception as e:
        logger.error(f"❌ Speech recognition failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

@app.post("/stt/recognize")
async def recognize_speech_file(file: UploadFile = File(...)):
    """
    ✅ Recognize speech from uploaded audio file
    """
    try:
        suffix = os.path.splitext(file.filename)[1] or '.wav'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        result = vosk_service.recognize(tmp_path)

        try:
            os.unlink(tmp_path)
        except:
            pass

        return {
            "recognized_text": result['text'],
            "confidence": result.get('confidence'),
            "success": True
        }

    except Exception as e:
        logger.error(f"❌ STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ HELPER FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def calculate_pronunciation_accuracy(recognized: str, target: str) -> float:
    """
    Calculate pronunciation accuracy using Levenshtein distance
    """
    if recognized == target:
        return 100.0

    # Simple character-level comparison
    max_len = max(len(recognized), len(target))
    if max_len == 0:
        return 0.0

    # Calculate Levenshtein distance
    distance = levenshtein_distance(recognized, target)
    accuracy = max(0, 100 * (1 - distance / max_len))

    return round(accuracy, 2)

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Calculate Levenshtein distance between two strings
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def save_user_recording(file_path: str, user_id: int, vocab_id: int) -> str:
    """
    Save user recording to MinIO
    """
    try:
        object_name = f"recordings/user_{user_id}/vocab_{vocab_id}_{uuid.uuid4().hex}.wav"
        tts_service.minio_client.fput_object(
            tts_service.bucket,
            object_name,
            file_path,
            content_type="audio/wav"
        )

        scheme = "https" if os.getenv("MINIO_SECURE", "false").lower() == "true" else "http"
        endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        return f"{scheme}://{endpoint}/{tts_service.bucket}/{object_name}"

    except Exception as e:
        logger.error(f"Failed to save recording: {str(e)}")
        return None

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ RUN SERVER
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