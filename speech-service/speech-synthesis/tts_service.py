from gtts import gTTS
import os
import tempfile
from pydub import AudioSegment
from loguru import logger
import hashlib
from minio import Minio
from minio.error import S3Error

class TTSService:
    def __init__(self):
        self.cache_enabled = os.getenv('TTS_CACHE_ENABLED', 'true').lower() == 'true'

        # MinIO setup
        self.minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        self.minio_access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.minio_secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.minio_secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        self.bucket = os.getenv("MINIO_BUCKET", "vocabulary-audio")

        self.minio_client = Minio(
            self.minio_endpoint,
            access_key=self.minio_access_key,
            secret_key=self.minio_secret_key,
            secure=self.minio_secure
        )

        # Create bucket if not exists
        try:
            if not self.minio_client.bucket_exists(self.bucket):
                self.minio_client.make_bucket(self.bucket)
                logger.info(f"✅ Created MinIO bucket: {self.bucket}")
        except Exception as e:
            logger.error(f"❌ MinIO bucket creation failed: {str(e)}")

    def check_minio_connection(self) -> bool:
        """Check if MinIO is accessible"""
        try:
            return self.minio_client.bucket_exists(self.bucket)
        except:
            return False

    def _get_cache_object_name(self, text: str, lang: str, vocab_id: int) -> str:
        """Generate cache object name based on text hash"""
        cache_key = f"{text}_{lang}"
        hash_obj = hashlib.md5(cache_key.encode())
        return f"tts/vocab_{vocab_id}_{hash_obj.hexdigest()}.mp3"

    def synthesize(self, text: str, lang: str = "en", vocab_id: int = 0, slow: bool = False) -> dict:
        """
        ✅ Generate speech from text and upload to MinIO
        Returns: dict with audio_url, duration, cached status
        """
        try:
            object_name = self._get_cache_object_name(text, lang, vocab_id)

            # Check if audio already exists in MinIO (cache)
            if self.cache_enabled:
                try:
                    self.minio_client.stat_object(self.bucket, object_name)
                    audio_url = self._get_minio_url(object_name)
                    logger.info(f"✅ Using cached audio: {object_name}")
                    
                    return {
                        'audio_url': audio_url,
                        'duration': None,  # Duration not calculated for cached
                        'cached': True
                    }
                except S3Error:
                    # Not cached, continue to generate
                    pass

            # Generate new audio
            logger.info(f"🔊 Generating TTS for vocab {vocab_id}: '{text}' (lang={lang})")

            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tmp_path = tmp_file.name

            # Generate TTS
            tts = gTTS(text=text, lang=lang, slow=slow)
            tts.save(tmp_path)

            # Get audio duration
            duration = self._get_audio_duration(tmp_path)

            # Upload to MinIO
            self.minio_client.fput_object(
                self.bucket,
                object_name,
                tmp_path,
                content_type="audio/mpeg"
            )

            audio_url = self._get_minio_url(object_name)

            # Cleanup temporary file
            try:
                os.unlink(tmp_path)
            except:
                pass

            logger.success(f"✅ Generated & uploaded audio: {object_name} ({duration}s)")

            return {
                'audio_url': audio_url,
                'duration': duration,
                'cached': False
            }

        except Exception as e:
            logger.error(f"❌ TTS generation failed: {str(e)}")
            raise

    def _get_audio_duration(self, filepath: str) -> float:
        """Get audio duration in seconds"""
        try:
            audio = AudioSegment.from_file(filepath)
            return round(len(audio) / 1000.0, 2)
        except Exception:
            return None

    def _get_minio_url(self, object_name: str) -> str:
        """Generate MinIO URL for object"""
        scheme = "https" if self.minio_secure else "http"
        return f"{scheme}://{self.minio_endpoint}/{self.bucket}/{object_name}"

    def delete_audio(self, vocab_id: int, language: str) -> bool:
        """
        ✅ Delete audio file from MinIO
        """
        try:
            # Generate object name pattern
            prefix = f"tts/vocab_{vocab_id}_"
            
            # List objects with prefix
            objects = self.minio_client.list_objects(self.bucket, prefix=prefix)
            
            deleted = False
            for obj in objects:
                self.minio_client.remove_object(self.bucket, obj.object_name)
                logger.info(f"🗑️ Deleted audio: {obj.object_name}")
                deleted = True

            return deleted

        except Exception as e:
            logger.error(f"❌ Delete audio failed: {str(e)}")
            return False

    def cleanup_old_files(self, days: int = 30):
        """
        ✅ Remove audio files older than specified days
        (Optional: can be run as cron job)
        """
        try:
            import datetime
            current_time = datetime.datetime.now()
            removed_count = 0

            objects = self.minio_client.list_objects(self.bucket, prefix="tts/")
            
            for obj in objects:
                # Check object age
                if obj.last_modified:
                    age = current_time - obj.last_modified.replace(tzinfo=None)
                    if age.days > days:
                        self.minio_client.remove_object(self.bucket, obj.object_name)
                        removed_count += 1

            logger.info(f"✅ Cleaned up {removed_count} old audio files")
            return removed_count

        except Exception as e:
            logger.error(f"❌ Cleanup failed: {str(e)}")
            return 0