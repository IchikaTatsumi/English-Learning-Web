import os
import wave
import json
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
from loguru import logger
import tempfile

class VoskService:
    def __init__(self):
        self.model_path = os.getenv(
            'VOSK_MODEL_PATH',
            'speech-recognition/models/vosk-model-small-en-us-0.15'
        )
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Vosk model on initialization"""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Vosk model not found at {self.model_path}")
                logger.info("Download model from: https://alphacephei.com/vosk/models")
                raise FileNotFoundError(f"Model not found at {self.model_path}")
            
            logger.info(f"Loading Vosk model from {self.model_path}...")
            self.model = Model(self.model_path)
            logger.success("Vosk model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Vosk model: {str(e)}")
            raise
    
    def is_ready(self):
        """Check if model is loaded"""
        return self.model is not None
    
    def _convert_to_wav(self, file_path: str) -> str:
        """Convert audio to WAV format if needed"""
        if file_path.lower().endswith('.wav'):
            return file_path
        
        logger.info(f"Converting {file_path} to WAV format...")
        try:
            audio = AudioSegment.from_file(file_path)
            # Convert to mono, 16kHz
            audio = audio.set_channels(1).set_frame_rate(16000)
            
            wav_path = tempfile.NamedTemporaryFile(delete=False, suffix='.wav').name
            audio.export(wav_path, format='wav')
            
            logger.success(f"Converted to WAV: {wav_path}")
            return wav_path
            
        except Exception as e:
            logger.error(f"Audio conversion failed: {str(e)}")
            raise
    
    def recognize(self, file_path: str) -> dict:
        """
        Recognize speech from audio file
        Returns: {
            'text': str,
            'confidence': float,
            'words': list
        }
        """
        converted_file = None
        try:
            # Convert to WAV if needed
            wav_path = self._convert_to_wav(file_path)
            converted_file = wav_path if wav_path != file_path else None
            
            # Open WAV file
            wf = wave.open(wav_path, "rb")
            
            # Validate format
            if wf.getnchannels() != 1:
                wf.close()
                raise ValueError("Audio must be mono channel")
            
            if wf.getsampwidth() != 2:
                wf.close()
                raise ValueError("Audio must be 16-bit PCM")
            
            if wf.getframerate() not in [8000, 16000, 32000, 44100, 48000]:
                wf.close()
                raise ValueError(f"Unsupported sample rate: {wf.getframerate()}")
            
            # Create recognizer
            rec = KaldiRecognizer(self.model, wf.getframerate())
            rec.SetWords(True)  # Enable word-level timestamps
            
            # Process audio
            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    if result.get('text'):
                        results.append(result)
            
            # Get final result
            final_result = json.loads(rec.FinalResult())
            if final_result.get('text'):
                results.append(final_result)
            
            wf.close()
            
            # Combine all text
            full_text = ' '.join([r.get('text', '') for r in results]).strip()
            
            # Calculate average confidence if available
            confidences = []
            all_words = []
            for r in results:
                if 'result' in r:
                    for word_info in r['result']:
                        confidences.append(word_info.get('conf', 0))
                        all_words.append(word_info)
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else None
            
            logger.info(f"Recognized: '{full_text}' (confidence: {avg_confidence})")
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'words': all_words
            }
            
        except Exception as e:
            logger.error(f"Speech recognition error: {str(e)}")
            raise
            
        finally:
            # Cleanup converted file
            if converted_file and os.path.exists(converted_file):
                try:
                    os.unlink(converted_file)
                except:
                    pass