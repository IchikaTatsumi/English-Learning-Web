import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface LoudSpeakerButtonProps {
  vocabId: number;
  audioPath?: string | null;
  className?: string;
}

export function LoudSpeakerButton({ 
  vocabId, 
  audioPath: initialAudioPath, 
  className = '' 
}: LoudSpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use custom hook to track audio status
  const { ready, loading, error, audioPath } = useVocabularyAudio(
    vocabId, 
    initialAudioPath
  );

  const playAudio = () => {
    if (!audioPath) return;

    try {
      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
        };
      }

      setIsPlaying(true);
      audioRef.current.play();
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <button
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed ${className}`}
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Generating...</span>
      </button>
    );
  }

  // Error state
  if (error) {
    return (
      <button
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 cursor-not-allowed ${className}`}
        disabled
        title={error}
      >
        <VolumeX className="w-4 h-4" />
        <span className="text-sm">Audio Error</span>
      </button>
    );
  }

  // Ready state
  return (
    <button
      onClick={isPlaying ? stopAudio : playAudio}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isPlaying
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      } ${className}`}
      title={isPlaying ? 'Stop audio' : 'Play pronunciation'}
    >
      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      <span className="text-sm">{isPlaying ? 'Playing...' : 'Listen'}</span>
    </button>
  );
}
