Speech Service - Python Backend
Speech Recognition (STT) và Text-to-Speech (TTS) service sử dụng Vosk và gTTS.
📋 Prerequisites

Python 3.8+
ffmpeg (cho audio processing)
Vosk model (download riêng)

🚀 Setup
1. Tạo Virtual Environment
``
cd speech
python -m venv venv

``
# Activate
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
2. Install Dependencies
``
pip install -r requirements.txt
``

3. Install ffmpeg
Ubuntu/Debian:
``
sudo apt-get update
sudo apt-get install ffmpeg
``
MacOS:
``
MacOS:
``
Windows:
Download từ https://ffmpeg.org/download.html và thêm vào PATH
4. Download Vosk Model
``
# Download model (370MB)
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

# Extract
unzip vosk-model-small-en-us-0.15.zip -d speech-recognition/models/

# Hoặc download manually và extract vào thư mục:
# speech-recognition/models/vosk-model-small-en-us-0.15/
``
5. Configure Environment
``
cp .env.example .env
# Edit .env nếu cần thay đổi cấu hình
``
6. Create Required Directories
``
mkdir -p speech-synthesis/voices
mkdir -p speech-recognition/models
``
🏃 Run Server
# Development
``
python main.py
``
# Hoặc với uvicorn:
``
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
``
# Production
``
uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4
``
📡 API Endpoints
# Health Check
``
GET /health
``
# Speech to Text (STT)
``
POST /api/speech/recognize
Content-Type: multipart/form-data

file: audio.wav
``
Response:
{
  "recognized_text": "hello world",
  "confidence": 0.95,
  "success": true
}
# Text to Speech (TTS)
POST /api/speech/synthesize
Content-Type: application/json

{
  "text": "Hello world",
  "lang": "en",
  "slow": false
}
Response:
json{
  "audio_url": "/api/speech/audio/tts_abc123.mp3",
  "duration": 2.5,
  "success": true
}
Simple TTS (Quick Test)
bashGET /api/speech/tts-simple?text=Hello

🐳 Docker Deployment
# Build Image
``
docker build -t speech-service .
``
# Docker compose
yaml
``
services:
  speech-service:
    build: ./speech
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - VOSK_MODEL_PATH=/app/models/vosk-model-small-en-us-0.15
    volumes:
      - ./speech/speech-synthesis/voices:/app/speech-synthesis/voices

``
📁 Project Structure
speech/
├── main.py                          # FastAPI app
├── requirements.txt
├── .env.example
├── README.md
├── speech-recognition/
│   ├── __init__.py
│   ├── vosk_service.py             # Vosk STT service
│   └── models/
│       └── vosk-model-small-en-us-0.15/
└── speech-synthesis/
    ├── __init__.py
    ├── tts_service.py              # gTTS service
    └── voices/                      # Generated audio files
⚙️ Configuration
Environment variables trong .env:

PORT: Server port (default: 5000)
VOSK_MODEL_PATH: Path to Vosk model
AUDIO_OUTPUT_DIR: Directory for generated audio
TTS_CACHE_ENABLED: Enable/disable audio caching
LOG_LEVEL: Logging level (INFO, DEBUG, ERROR)

🔧 Troubleshooting
"Model not found" error

Đảm bảo đã download và extract Vosk model đúng vị trí
Check VOSK_MODEL_PATH trong .env

"ffmpeg not found" error

Install ffmpeg theo hướng dẫn ở trên
Verify: ffmpeg -version

"Audio format not supported"

Đảm bảo audio file là WAV, MP3, hoặc WebM
Server sẽ tự động convert sang định dạng phù hợp

Port already in use

Thay đổi PORT trong .env
Hoặc kill process đang dùng port: lsof -ti:5000 | xargs kill

📝 Notes

Vosk model "small-en-us" (370MB) phù hợp cho development
Với production, xem xét dùng model lớn hơn để accuracy tốt hơn
TTS caching giúp giảm thời gian response cho text đã generate
Audio files sẽ được cleanup tự động sau 24h (có thể config)


🔗 Integration với NestJS Backend
Trong NestJS backend, gọi Python service qua HTTP:

``
// speech.adapter.ts
async recognizeSpeech(audioData: string) {
  const formData = new FormData();
  formData.append('file', audioData);
  
  const response = await axios.post(
    'http://localhost:5000/api/speech/recognize',
    formData
  );
  
  return response.data;
}
``
