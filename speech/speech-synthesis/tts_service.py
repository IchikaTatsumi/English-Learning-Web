from gtts import gTTS
import os
import uuid
from pydub import AudioSegment
from loguru import logger
import hashlib
import time

class TTSService:
    def __init__(self):
        self.output_dir = os.getenv('AUDIO_OUTPUT_DIR', 'speech-synthesis/voices')
        self.cache_enabled = os.getenv('TTS_CACHE_ENABLED', 'true').lower() == 'true'
        self._ensure_output_dir()
    
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
        Generate speech from text
        Args:
            text: Text to synthesize
            lang: Language code (en, vi, etc.)
            slow: Slower speech for learning
        Returns:
            dict with filename, filepath, and duration
        """
        try:
            # Check cache first
            if self.cache_enabled:
                cached_filename = self._get_cache_filename(text, lang, slow)
                cached_path = os.path.join(self.output_dir, cached_filename)
                
                if os.path.exists(cached_path):
                    logger.info(f"Using cached audio: {cached_filename}")
                    duration = self._get_audio_duration(cached_path)
                    return {
                        'filename': cached_filename,
                        'filepath': cached_path,
                        'duration': duration,
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
            
            logger.success(f"Generated audio: {filename} ({duration}s)")
            
            # Save as cached if enabled
            if self.cache_enabled:
                cached_filename = self._get_cache_filename(text, lang, slow)
                cached_path = os.path.join(self.output_dir, cached_filename)
                
                # Copy to cache
                import shutil
                shutil.copy2(filepath, cached_path)
                logger.info(f"Cached audio as: {cached_filename}")
            
            return {
                'filename': filename,
                'filepath': filepath,
                'duration': duration,
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
        except:
            return None
    
    def synthesize_with_wav(self, text: str, lang: str = "en", slow: bool = False) -> dict:
        """
        Generate both MP3 and WAV versions
        """
        result = self.synthesize(text, lang, slow)
        
        try:
            # Convert to WAV
            mp3_path = result['filepath']
            wav_filename = result['filename'].replace('.mp3', '.wav')
            wav_path = os.path.join(self.output_dir, wav_filename)
            
            audio = AudioSegment.from_mp3(mp3_path)
            audio.export(wav_path, format='wav')
            
            logger.info(f"Converted to WAV: {wav_filename}")
            
            result['wav_filename'] = wav_filename
            result['wav_filepath'] = wav_path
            
        except Exception as e:
            logger.warning(f"WAV conversion failed: {str(e)}")
        
        return result
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Remove audio files older than max_age_hours
        """
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