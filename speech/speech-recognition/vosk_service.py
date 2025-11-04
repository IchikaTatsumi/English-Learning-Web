import os
import wave
import json
import tempfile
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
from loguru import logger


class VoskService:
    def __init__(self):
        self.model_path = os.getenv(
            'VOSK_MODEL_PATH',
            'speech-recognition/models/vosk-model-small-en-us-0.15'
        )
        self.sample_rate = int(os.getenv("VOSK_SAMPLE_RATE", 16000))
        self.model = None
        self._load_model()

    # --- Load model ---
    def _load_model(self):
        """Load Vosk model into memory."""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Vosk model not found at {self.model_path}")
                logger.info("Download model from: https://alphacephei.com/vosk/models")
                raise FileNotFoundError(f"Model not found at {self.model_path}")

            logger.info(f"Loading Vosk model from {self.model_path}...")
            self.model = Model(self.model_path)
            logger.success("✅ Vosk model loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load Vosk model: {str(e)}")
            raise

    # --- Health check ---
    def is_ready(self) -> bool:
        """Check if model is loaded."""
        return self.model is not None

    # --- Convert audio ---
    def _convert_to_wav(self, file_path: str) -> str:
        """Convert audio file (MP3/WAV/OGG/M4A) to mono WAV at 16kHz."""
        try:
            audio = AudioSegment.from_file(file_path)
            audio = audio.set_channels(1).set_frame_rate(self.sample_rate)
            wav_path = tempfile.NamedTemporaryFile(delete=False, suffix='.wav').name
            audio.export(wav_path, format='wav')
            logger.info(f"Converted {file_path} → {wav_path}")
            return wav_path
        except Exception as e:
            logger.error(f"Audio conversion failed: {str(e)}")
            raise

    # --- Recognition logic ---
    def recognize(self, file_path: str) -> dict:
        """
        Recognize speech from an audio file.
        Returns dict: {
            'text': str,
            'confidence': float,
            'words': [ { word, conf, start, end } ]
        }
        """
        converted_file = None
        try:
            # Convert to WAV
            wav_path = self._convert_to_wav(file_path)
            converted_file = wav_path if wav_path != file_path else None

            wf = wave.open(wav_path, "rb")

            if wf.getnchannels() != 1:
                raise ValueError("Audio must be mono")
            if wf.getsampwidth() != 2:
                raise ValueError("Audio must be 16-bit PCM")

            rec = KaldiRecognizer(self.model, wf.getframerate())
            rec.SetWords(True)

            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    if result.get('text'):
                        results.append(result)

            final_result = json.loads(rec.FinalResult())
            if final_result.get('text'):
                results.append(final_result)
            wf.close()

            # Tổng hợp kết quả
            text = ' '.join([r.get('text', '') for r in results]).strip()
            all_words = []
            confidences = []
            for r in results:
                if 'result' in r:
                    for w in r['result']:
                        all_words.append(w)
                        confidences.append(w.get('conf', 0))

            avg_conf = round(sum(confidences) / len(confidences), 3) if confidences else 0

            logger.info(f"🗣 Recognized: \"{text}\" (conf: {avg_conf})")

            return {
                'text': text,
                'confidence': avg_conf,
                'words': all_words
            }

        except Exception as e:
            logger.error(f"Recognition error: {str(e)}")
            return {
                'error': str(e),
                'text': '',
                'confidence': 0.0,
                'words': []
            }

        finally:
            if converted_file and os.path.exists(converted_file):
                try:
                    os.unlink(converted_file)
                except Exception:
                    pass
