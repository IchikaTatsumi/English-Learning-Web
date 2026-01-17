import os
import base64
import tempfile
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from speech_recognition.vosk_service import VoskService

services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Chỉ khởi tạo model nhận diện giọng nói
    services["vosk"] = VoskService()
    yield
    services.clear()

app = FastAPI(title="Speech Recognition API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class STTRequest(BaseModel):
    audio_base64: str
    target_word: str

@app.post("/stt/recognize-base64")
async def recognize_speech(request: STTRequest):
    tmp_path = None
    try:
        audio_bytes = base64.b64decode(request.audio_base64)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        result = services["vosk"].recognize(tmp_path)
        return {
            "recognized_text": result.get('text', ''),
            "confidence": result.get('confidence', 0.0)
        }
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.get("/health")
def health():
    return {"status": "healthy", "vosk_ready": "vosk" in services}