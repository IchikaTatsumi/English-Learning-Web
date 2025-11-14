import os
import wave
import json
import tempfile
from typing import Dict, List, Optional
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
from loguru import logger


class VoskService:
    """
    ✅ Vosk Speech Recognition Service
    
    Supports:
    - Multiple audio formats (WAV, MP3, OGG, M4A, WebM)
    - Automatic audio conversion to 16kHz mono WAV
    - Word-level timestamps and confidence scores
    - Error handling and logging
    """
    
    def __init__(self):
        self.model_path = os.getenv(
            'VOSK_MODEL_PATH',
            'speech-recognition/models/vosk-model-small-en-us-0.15'
        )
        self.sample_rate = int(os.getenv("VOSK_SAMPLE_RATE", 16000))
        self.model: Optional[Model] = None
        self._load_model()

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 🔧 INITIALIZATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def _load_model(self) -> None:
        """Load Vosk model into memory."""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"❌ Vosk model not found at {self.model_path}")
                logger.info("📥 Download model from: https://alphacephei.com/vosk/models")
                logger.info("Recommended: vosk-model-small-en-us-0.15 (370MB)")
                raise FileNotFoundError(f"Model not found at {self.model_path}")

            # ✅ Verify model structure
            required_dirs = ['am', 'conf', 'graph']
            for dir_name in required_dirs:
                dir_path = os.path.join(self.model_path, dir_name)
                if not os.path.exists(dir_path):
                    raise FileNotFoundError(
                        f"Invalid model structure: missing '{dir_name}' directory"
                    )

            logger.info(f"🔄 Loading Vosk model from {self.model_path}...")
            self.model = Model(self.model_path)
            logger.success("✅ Vosk model loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load Vosk model: {str(e)}")
            raise

    def is_ready(self) -> bool:
        """Check if model is loaded and ready."""
        return self.model is not None

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 🎵 AUDIO CONVERSION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def _convert_to_wav(self, file_path: str) -> str:
        """
        Convert audio file to mono WAV at target sample rate.
        
        Supports: MP3, WAV, OGG, M4A, WebM, FLAC
        Returns: Path to converted WAV file
        """
        try:
            logger.info(f"🔄 Converting audio: {file_path}")
            
            # Load audio file (pydub auto-detects format)
            audio = AudioSegment.from_file(file_path)
            
            # Convert to mono 16kHz 16-bit PCM WAV
            audio = audio.set_channels(1)  # Mono
            audio = audio.set_frame_rate(self.sample_rate)  # 16kHz
            audio = audio.set_sample_width(2)  # 16-bit
            
            # Create temporary WAV file
            wav_path = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix='.wav',
                prefix='vosk_'
            ).name
            
            # Export as WAV
            audio.export(wav_path, format='wav')
            
            duration = len(audio) / 1000.0  # seconds
            logger.success(
                f"✅ Converted to WAV: {wav_path} "
                f"(duration: {duration:.2f}s, rate: {self.sample_rate}Hz)"
            )
            
            return wav_path
            
        except Exception as e:
            logger.error(f"❌ Audio conversion failed: {str(e)}")
            raise

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 🎤 SPEECH RECOGNITION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def recognize(self, file_path: str) -> Dict:
        """
        Recognize speech from an audio file.
        
        Args:
            file_path: Path to audio file (any format)
            
        Returns:
            Dict containing:
            - text: str - Recognized text
            - confidence: float - Average confidence score (0-1)
            - words: List[Dict] - Word-level results with timestamps
            - error: str - Error message if failed (optional)
        """
        converted_file = None
        wav_file = None
        
        try:
            if not self.model:
                raise RuntimeError("Vosk model not loaded")

            # ✅ Convert audio to proper format
            wav_path = self._convert_to_wav(file_path)
            converted_file = wav_path if wav_path != file_path else None

            # ✅ Open WAV file
            wav_file = wave.open(wav_path, "rb")

            # ✅ Validate audio format
            if wav_file.getnchannels() != 1:
                raise ValueError(
                    f"Audio must be mono, got {wav_file.getnchannels()} channels"
                )
            if wav_file.getsampwidth() != 2:
                raise ValueError(
                    f"Audio must be 16-bit PCM, got {wav_file.getsampwidth() * 8}-bit"
                )

            # ✅ Create recognizer
            rec = KaldiRecognizer(self.model, wav_file.getframerate())
            rec.SetWords(True)  # Enable word-level timestamps

            # ✅ Process audio in chunks
            results = []
            chunk_size = 4000  # bytes
            
            while True:
                data = wav_file.readframes(chunk_size)
                if len(data) == 0:
                    break
                    
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    if result.get('text'):
                        results.append(result)

            # ✅ Get final result
            final_result = json.loads(rec.FinalResult())
            if final_result.get('text'):
                results.append(final_result)

            # ✅ Close WAV file
            wav_file.close()
            wav_file = None

            # ✅ Aggregate results
            recognized_text = ' '.join([r.get('text', '') for r in results]).strip()
            
            all_words = []
            confidences = []
            
            for r in results:
                if 'result' in r:  # Word-level results
                    for w in r['result']:
                        all_words.append(w)
                        confidences.append(w.get('conf', 0))

            # Calculate average confidence
            avg_confidence = (
                round(sum(confidences) / len(confidences), 3) 
                if confidences else 0.0
            )

            logger.info(
                f"🗣️ Recognized: \"{recognized_text}\" "
                f"(confidence: {avg_confidence:.3f}, words: {len(all_words)})"
            )

            return {
                'text': recognized_text,
                'confidence': avg_confidence,
                'words': all_words,
                'word_count': len(all_words)
            }

        except Exception as e:
            logger.error(f"❌ Recognition error: {str(e)}")
            return {
                'error': str(e),
                'text': '',
                'confidence': 0.0,
                'words': [],
                'word_count': 0
            }

        finally:
            # ✅ Cleanup resources
            if wav_file:
                try:
                    wav_file.close()
                except Exception:
                    pass
                    
            if converted_file and os.path.exists(converted_file):
                try:
                    os.unlink(converted_file)
                    logger.debug(f"🗑️ Cleaned up temp file: {converted_file}")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to cleanup temp file: {e}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 📊 UTILITY METHODS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def get_model_info(self) -> Dict:
        """Get information about the loaded model."""
        return {
            'model_path': self.model_path,
            'sample_rate': self.sample_rate,
            'loaded': self.is_ready(),
            'exists': os.path.exists(self.model_path) if self.model_path else False
        }

    def validate_audio_file(self, file_path: str) -> Dict:
        """
        Validate audio file without processing.
        
        Returns:
            Dict with validation results
        """
        try:
            audio = AudioSegment.from_file(file_path)
            return {
                'valid': True,
                'duration': len(audio) / 1000.0,  # seconds
                'channels': audio.channels,
                'sample_rate': audio.frame_rate,
                'sample_width': audio.sample_width,
                'format': 'valid'
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }