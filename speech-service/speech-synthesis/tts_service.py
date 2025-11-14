from gtts import gTTS
import os
import uuid
from pydub import AudioSegment
from loguru import logger
import hashlib
import time
import shutil
from minio import Minio

class TTSService:
    def __init__(self):
        self.output_dir = os.getenv('AUDIO_OUTPUT_DIR', 'speech-synthesis/voices')
        self.cache_enabled = os.getenv('TTS_CACHE_ENABLED', 'true').lower() == 'true'
        self._ensure_output_dir()

        # MinIO setup
        self.minio_client = Minio(
            os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
            secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
            secure=os.getenv("MINIO_SECURE", "false").lower() == "true"
        )
        self.bucket = os.getenv("MINIO_BUCKET", "audios")

        # Tạo bucket nếu chưa có
        if not self.minio_client.bucket_exists(self.bucket):
            self.minio_client.make_bucket(self.bucket)
            logger.info(f"Created MinIO bucket: {self.bucket}")

    def _ensure_output_dir(self):
        """Create output directory if not exists"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            logger.info(f"Created audio output directory: {self.output_dir}")

    def _get_cache_filename(self, text: str, lang: str, slow: bool) -> str:
        """Generate cache filename based on text hash"""
        cache_key = f"{text}_{lang}_{slow}"
        hash_obj = hashlib.md5(cache_key.encode())
        return f"tts_{hash_obj.hexdigest()}.mp3"

    def synthesize(self, text: str, lang: str = "en", slow: bool = False) -> dict:
        """
        Generate speech from text and upload to MinIO
        Returns: dict with audio_url, filename, duration
        """
        try:
            # Check cache first
            if self.cache_enabled:
                cached_filename = self._get_cache_filename(text, lang, slow)
                cached_path = os.path.join(self.output_dir, cached_filename)

                if os.path.exists(cached_path):
                    logger.info(f"Using cached audio: {cached_filename}")
                    duration = self._get_audio_duration(cached_path)
                    audio_url = self._upload_to_minio(cached_path, cached_filename)
                    return {
                        'filename': cached_filename,
                        'filepath': cached_path,
                        'duration': duration,
                        'audio_url': audio_url,
                        'cached': True
                    }

            # Generate new audio
            filename = f"tts_{uuid.uuid4().hex}_{int(time.time())}.mp3"
            filepath = os.path.join(self.output_dir, filename)

            logger.info(f"Generating TTS for: '{text}' (lang={lang}, slow={slow})")

            tts = gTTS(text=text, lang=lang, slow=slow)
            tts.save(filepath)

            # Get duration
            duration = self._get_audio_duration(filepath)

            # Upload to MinIO
            audio_url = self._upload_to_minio(filepath, filename)

            logger.success(f"Generated & uploaded audio: {filename} ({duration}s)")

            # Save cache
            if self.cache_enabled:
                cached_filename = self._get_cache_filename(text, lang, slow)
                cached_path = os.path.join(self.output_dir, cached_filename)
                shutil.copy2(filepath, cached_path)
                logger.info(f"Cached audio as: {cached_filename}")

            return {
                'filename': filename,
                'filepath': filepath,
                'duration': duration,
                'audio_url': audio_url,
                'cached': False
            }

        except Exception as e:
            logger.error(f"TTS generation failed: {str(e)}")
            raise

    def _get_audio_duration(self, filepath: str) -> float:
        """Get audio duration in seconds"""
        try:
            audio = AudioSegment.from_file(filepath)
            return round(len(audio) / 1000.0, 2)
        except Exception:
            return None

    def _upload_to_minio(self, file_path: str, object_name: str) -> str:
        """Upload file to MinIO and return its URL"""
        try:
            self.minio_client.fput_object(
                self.bucket,
                object_name,
                file_path,
                content_type="audio/mpeg"
            )

            scheme = "https" if os.getenv("MINIO_SECURE", "false").lower() == "true" else "http"
            endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
            return f"{scheme}://{endpoint}/{self.bucket}/{object_name}"

        except Exception as e:
            logger.error(f"Upload to MinIO failed: {str(e)}")
            raise

    def cleanup_old_files(self, max_age_hours: int = 24):
        """Remove audio files older than max_age_hours"""
        try:
            current_time = time.time()
            removed_count = 0

            for filename in os.listdir(self.output_dir):
                if not filename.startswith('tts_'):
                    continue

                filepath = os.path.join(self.output_dir, filename)
                file_age = current_time - os.path.getmtime(filepath)

                if file_age > (max_age_hours * 3600):
                    os.unlink(filepath)
                    removed_count += 1

            logger.info(f"Cleaned up {removed_count} old audio files")

        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
