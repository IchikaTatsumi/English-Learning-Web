import os, wave, json
from vosk import Model, KaldiRecognizer

# Đường dẫn model — tải từ: https://alphacephei.com/vosk/models
MODEL_PATH = "speech-recognition/models/vosk-model-small-en-us-0.15"

# Load model khi server khởi động
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
model = Model(MODEL_PATH)

def recognize_speech(file_path: str):
    wf = wave.open(file_path, "rb")

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() not in [8000, 16000]:
        raise ValueError("Audio must be WAV mono PCM (16kHz or 8kHz).")

    rec = KaldiRecognizer(model, wf.getframerate())
    text_result = ""

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text_result += " " + result.get("text", "")

    final_result = json.loads(rec.FinalResult())
    text_result += " " + final_result.get("text", "")
    wf.close()

    os.remove(file_path)  # Xoá file sau khi xử lý
    return text_result.strip()
