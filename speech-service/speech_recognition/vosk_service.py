import os
import wave
import json
import tempfile
from typing import Dict, Optional
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
from loguru import logger


class VoskService:
    """
    ✅ Vosk Speech Recognition Service (Cleaned & Optimized)
    """

    def __init__(self):
        # Configuration
        self.model_path = os.getenv(
            'VOSK_MODEL_PATH',
            'speech-recognition/models/vosk-model-en-us-0.42-gigaspeech'
        )
        # ✅ FIX: Sửa lỗi thiếu key env var ở phiên bản cũ
        self.sample_rate = int(os.getenv("VOSK_SAMPLE_RATE", 16000))
        
        self.model: Optional[Model] = None
        self._load_model()

    def _load_model(self) -> None:
        """Load and verify Vosk model."""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"❌ Model not found: {self.model_path}")
                raise FileNotFoundError(f"Vosk model missing at {self.model_path}")

            # Verify structure
            for required in ['am', 'conf', 'graph']:
                if not os.path.exists(os.path.join(self.model_path, required)):
                    raise FileNotFoundError(f"Invalid model: missing '{required}'")

            logger.info(f"🔄 Loading Vosk Model ({self.model_path})...")
            self.model = Model(self.model_path)
            logger.success("✅ Vosk Model loaded successfully")

        except Exception as e:
            logger.critical(f"❌ Failed to init Vosk: {e}")
            raise

    def is_ready(self) -> bool:
        return self.model is not None

    def _convert_to_wav(self, source_path: str) -> str:
        """Convert any audio to clean 16kHz Mono WAV."""
        try:
            audio = AudioSegment.from_file(source_path)
            
            # Standardize format for Vosk (Mono, 16kHz, 16bit)
            audio = audio.set_channels(1) \
                         .set_frame_rate(self.sample_rate) \
                         .set_sample_width(2)

            # Write to temp file
            wav_tmp = tempfile.NamedTemporaryFile(
                delete=False, suffix='.wav', prefix='vosk_'
            ).name
            
            audio.export(wav_tmp, format='wav')
            return wav_tmp
            
        except Exception as e:
            logger.error(f"❌ Audio conversion error: {e}")
            raise

    def recognize(self, file_path: str) -> Dict:
        """
        Process audio file and return recognition result.
        Handles conversion and cleanup automatically.
        """
        if not self.model:
            raise RuntimeError("Vosk model is not loaded!")

        converted_path = None
        wav_file = None

        try:
            # 1. Convert audio
            converted_path = self._convert_to_wav(file_path)
            
            # 2. Read WAV
            wav_file = wave.open(converted_path, "rb")
            
            if wav_file.getnchannels() != 1 or wav_file.getsampwidth() != 2:
                raise ValueError("Audio must be Mono 16-bit PCM")

            # 3. Recognition Loop
            rec = KaldiRecognizer(self.model, wav_file.getframerate())
            rec.SetWords(True)

            results = []
            while True:
                data = wav_file.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    part = json.loads(rec.Result())
                    if part.get('text'): results.append(part)

            final_part = json.loads(rec.FinalResult())
            if final_part.get('text'): results.append(final_part)

            # 4. Process Results
            full_text = ' '.join([r.get('text', '') for r in results]).strip()
            all_words = [w for r in results if 'result' in r for w in r['result']]
            
            # Calculate Confidence
            avg_conf = 0.0
            if all_words:
                avg_conf = sum(w.get('conf', 0) for w in all_words) / len(all_words)

            logger.info(f"🗣️ Result: '{full_text}' (Conf: {avg_conf:.2f})")

            return {
                'text': full_text,
                'confidence': round(avg_conf, 3),
                'words': all_words,
                'word_count': len(all_words)
            }

        except Exception as e:
            logger.error(f"❌ Recognition failed: {e}")
            return {'error': str(e), 'text': '', 'confidence': 0.0}

        finally:
            # Cleanup
            if wav_file: wav_file.close()
            if converted_path and os.path.exists(converted_path):
                os.remove(converted_path)