import { useState, useEffect, useCallback } from 'react';

interface VocabularyAudioStatus {
  ready: boolean;
  loading: boolean;
  error: string | null;
  audioPath: string | null;
}

export function useVocabularyAudio(vocabId: number, initialAudioPath?: string | null) {
  const [status, setStatus] = useState<VocabularyAudioStatus>({
    ready: !!initialAudioPath,
    loading: !initialAudioPath,
    error: null,
    audioPath: initialAudioPath || null,
  });

  const checkAudioStatus = useCallback(async () => {
    if (status.ready) return; // Already have audio

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/vocabularies/${vocabId}/tts-status`
      );
      
      if (!response.ok) throw new Error('Failed to check audio status');
      
      const data = await response.json();
      
      if (data.ready && data.audioPath) {
        setStatus({
          ready: true,
          loading: false,
          error: null,
          audioPath: data.audioPath,
        });
      }
    } catch (error) {
      console.error('Error checking audio status:', error);
      setStatus(prev => ({
        ...prev,
        error: 'Failed to load audio',
        loading: false,
      }));
    }
  }, [vocabId, status.ready]);

  useEffect(() => {
    if (!status.ready && !status.error) {
      // Poll every 2 seconds for audio
      const interval = setInterval(checkAudioStatus, 2000);
      
      // Initial check
      checkAudioStatus();
      
      // Cleanup
      return () => clearInterval(interval);
    }
  }, [checkAudioStatus, status.ready, status.error]);

  return status;
}