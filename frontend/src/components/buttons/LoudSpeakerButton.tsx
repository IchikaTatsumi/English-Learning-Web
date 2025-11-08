'use client';

import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface LoudspeakerButtonProps {
  audioPath: string | null;
  word: string;
  size?: 'sm' | 'default' | 'lg';
}

export function LoudspeakerButton({ audioPath, word, size = 'default' }: LoudspeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!audioPath) {
      console.warn('No audio path provided for:', word);
      return;
    }

    setIsPlaying(true);
    const audio = new Audio(audioPath);
    
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      console.error('Error playing audio for:', word);
      setIsPlaying(false);
    };
    
    audio.play();
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={playAudio}
      disabled={!audioPath || isPlaying}
      className="h-6 w-6 p-0"
    >
      <Volume2 className={`h-3 w-3 ${isPlaying ? 'text-blue-600' : ''}`} />
    </Button>
  );
}