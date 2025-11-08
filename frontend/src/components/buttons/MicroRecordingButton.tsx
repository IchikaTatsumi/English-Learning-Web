'use client';

import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MicroRecordingButtonProps {
  vocabId: number;
  targetWord: string;
  onResult: (result: { vocabId: number; score: number; recognized: string }) => void;
}

export function MicroRecordingButton({ vocabId, targetWord, onResult }: MicroRecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // TODO: Implement Vosk STT integration
      console.log('Recording started for:', targetWord);
      
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        // Mock result
        onResult({
          vocabId,
          score: Math.random() * 100,
          recognized: targetWord
        });
      }, 3000);
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isRecording ? stopRecording : startRecording}
      className={isRecording ? 'text-red-500' : 'text-gray-400'}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}