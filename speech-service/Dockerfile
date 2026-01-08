# speech-service/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Cài đặt FFmpeg và các thư viện hệ thống (Bắt buộc cho Audio & Vosk)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    python3-dev \
    libportaudio2 \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]