Speech Service - Python Backend
Speech Recognition (STT) và Text-to-Speech (TTS) service sử dụng Vosk và gTTS.
📋 Prerequisites

Python 3.8+
ffmpeg (cho audio processing)
Vosk model (download riêng)

# 🚀 Installation Guide

# Step 1: Clean Install (Recommended)
  # Create Virtual Environment
``
cd speech-service
python -m venv venv
``
  # Remove old virtual environment (if exists)
rm -rf venv

  # Activate
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate   # Windows

  # Upgrade pip
pip install --upgrade pip setuptools wheel

  # Install dependencies
pip install -r requirements.txt
# Step 2: Install System Dependencies
bash# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg portaudio19-dev python3-dev

  # MacOS
brew install ffmpeg portaudio

  # Windows
Download ffmpeg from https://ffmpeg.org/download.html
Add to PATH
# Step 3: Verify Installation
bash# Run verification script
python verify_dependencies.py

# Expected output:
# ✅ All dependencies are installed!
# You're ready to run the Speech Service! 🚀
# Step 4: Download Vosk Model
bash# Download model (370MB)
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

# Extract
unzip vosk-model-small-en-us-0.15.zip -d speech-recognition/models/

# Verify structure
ls -la speech-recognition/models/vosk-model-small-en-us-0.15/
# Should see: am/  conf/  graph/  ivector/

🔧 Troubleshooting
Issue 1: pip install fails for vosk
bash# Solution: Install system dependencies first
sudo apt-get install -y python3-dev build-essential

# Then retry
pip install vosk
Issue 2: pydub can't find ffmpeg
bash# Verify ffmpeg is installed
ffmpeg -version

# If not found, install:
sudo apt-get install ffmpeg  # Ubuntu
brew install ffmpeg          # MacOS
Issue 3: MinIO connection errors
bash# Check if MinIO is running
docker ps | grep minio

# Start MinIO if needed
docker start minio

# Or run new container
docker run -d -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
Issue 4: Import errors
bash# Clear pip cache and reinstall
pip cache purge
pip uninstall -y $(pip freeze)
pip install -r requirements.txt