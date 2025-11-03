from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import FileResponse
from speech_recognition.vosk_service import recognize_speech
from speech_synthesis.tts_service import synthesize_speech
import tempfile, os

app = FastAPI(
    title="Speech Service",
    description="API xử lý nhận diện và phát âm giọng nói (Vosk + gTTS)",
    version="1.0.0"
)

# -------------------------
# Speech Recognition (STT)
# -------------------------
@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    tmp.write(await file.read())
    tmp.close()
    try:
        text = recognize_speech(tmp.name)
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}

# -------------------------
# Speech Synthesis (TTS)
# -------------------------
@app.get("/tts")
async def tts(text: str = Query(..., description="Text cần phát âm")):
    result = synthesize_speech(text)
    return FileResponse(result["mp3"], media_type="audio/mpeg", filename=os.path.basename(result["mp3"]))

# -------------------------
# Kiểm tra API
# -------------------------
@app.get("/")
def root():
    return {
        "message": "✅ Speech API running",
        "routes": ["/stt (POST)", "/tts?text=hello (GET)"]
    }
