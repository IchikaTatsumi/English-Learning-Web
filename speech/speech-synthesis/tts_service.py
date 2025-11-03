from gtts import gTTS
import os, uuid
from pydub import AudioSegment

OUTPUT_DIR = "speech-synthesis/voices"

def synthesize_speech(text: str, lang="en"):
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # tạo file mp3 tạm
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(OUTPUT_DIR, filename)

    tts = gTTS(text=text, lang=lang)
    tts.save(filepath)

    # chuyển sang wav để frontend dễ phát nếu cần
    wav_path = filepath.replace(".mp3", ".wav")
    sound = AudioSegment.from_mp3(filepath)
    sound.export(wav_path, format="wav")

    return {"mp3": filepath, "wav": wav_path}
