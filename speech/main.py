from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import uuid
from loguru import logger
from dotenv import load_dotenv

from speech_recognition.vosk_service import VoskService
from speech_synthesis.tts_service import TTSService

load_dotenv()

app = FastAPI(
    title="English Learning Speech API",
    description="Speech Recognition & Text-to-Speech Service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vosk_service = VoskService()
tts_service = TTSService()

# Request/Response models
class TTSRequest(BaseModel):
    text: str
    lang: str = "en"
    slow: bool = False

class STTResponse(BaseModel):
    recognized_text: str
    confidence: Optional[float] = None
    success: bool

class TTSResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
    success: bool

@app.get("/")
def root():
    return {
        "message": "✅ Speech API is running",
        "endpoints": {
            "stt": "POST /api/speech/recognize - Speech to Text",
            "tts": "POST /api/speech/synthesize - Text to Speech",
            "health": "GET /health - Health check"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "vosk_model_loaded": vosk_service.is_ready(),
        "tts_service": "ready"
    }

@app.post("/api/speech/recognize", response_model=STTResponse)
async def recognize_speech(file: UploadFile = File(...)):
    """
    Speech to Text using Vosk
    Accepts: audio/wav, audio/mp3, audio/webm
    """
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be audio format")
        
        # Create temporary file
        suffix = os.path.splitext(file.filename)[1] or '.wav'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Recognize speech
        result = vosk_service.recognize(tmp_path)
        
        # Cleanup
        try:
            os.unlink(tmp_path)
        except:
            pass
        
        return STTResponse(
            recognized_text=result['text'],
            confidence=result.get('confidence'),
            success=True
        )
        
    except Exception as e:
        logger.error(f"STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech recognition failed: {str(e)}")

@app.post("/api/speech/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Text to Speech using gTTS
    Returns audio file URL
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Generate speech
        result = tts_service.synthesize(
            text=request.text,
            lang=request.lang,
            slow=request.slow
        )
        
        return JSONResponse({
            "audio_url": f"/api/speech/audio/{result['filename']}",
            "duration": result.get('duration'),
            "success": True
        })
        
    except Exception as e:
        logger.error(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@app.get("/api/speech/audio/{filename}")
async def get_audio(filename: str):
    """
    Serve generated audio files
    """
    try:
        audio_dir = os.getenv('AUDIO_OUTPUT_DIR', 'speech-synthesis/voices')
        file_path = os.path.join(audio_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=filename
        )
        
    except Exception as e:
        logger.error(f"Audio serve error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/speech/tts-simple")
async def tts_simple(text: str = Query(..., min_length=1, max_length=500)):
    """
    Simple TTS endpoint for quick testing
    Usage: GET /api/speech/tts-simple?text=Hello
    """
    try:
        result = tts_service.synthesize(text=text, lang="en", slow=False)
        audio_dir = os.getenv('AUDIO_OUTPUT_DIR', 'speech-synthesis/voices')
        file_path = os.path.join(audio_dir, result['filename'])
        
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=result['filename']
        )
    except Exception as e:
        logger.error(f"Simple TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )