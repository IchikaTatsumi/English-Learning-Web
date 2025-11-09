'use client';

import { useState, useCallback } from 'react';
import { speechService } from '../services/speech.service';
import {
  RecognizeSpeechDto,
  TextToSpeechDto,
  SpeechRecognitionResultDto,
  TextToSpeechResultDto,
  PronunciationTipsDto,
} from '../dtos/speech.dto';

export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognizeSpeech = useCallback(async (dto: RecognizeSpeechDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await speechService.recognizeSpeech(dto);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech recognition failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const textToSpeech = useCallback(async (dto: TextToSpeechDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await speechService.textToSpeech(dto);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text to speech failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordAudio = useCallback(async (durationMs: number = 3000) => {
    setIsRecording(true);
    setError(null);
    try {
      const audioData = await speechService.recordAudio(durationMs);
      return audioData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio recording failed');
      throw err;
    } finally {
      setIsRecording(false);
    }
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await speechService.playAudio(base64Audio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio playback failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPronunciationTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tips = await speechService.getPronunciationTips();
      return tips;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tips');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isRecording,
    isLoading,
    error,
    recognizeSpeech,
    textToSpeech,
    recordAudio,
    playAudio,
    getPronunciationTips,
  };
}