import React from 'react';
import { LoudSpeakerButton } from './buttons/LoudSpeakerButton';
import { MicroRecordingButton } from './buttons/MicroRecordingButton';
import { RecognitionResult } from './buttons/MicroRecordingButton';

interface VocabularyCardProps {
  vocabulary: {
    id: number;
    word: string;
    meaningEn: string;
    meaningVi: string;
    audioPath?: string | null;
  };
}

export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const handleRecordingComplete = (result: RecognitionResult) => {
    console.log('Recording result:', result);
    // Handle result (update UI, save progress, etc.)
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Word and meanings */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{vocabulary.word}</h3>
        <p className="text-gray-600">{vocabulary.meaningEn}</p>
        <p className="text-gray-500 text-sm">{vocabulary.meaningVi}</p>
      </div>

      {/* Audio controls */}
      <div className="flex flex-col gap-3">
        {/* Play pronunciation */}
        <LoudSpeakerButton
          vocabId={vocabulary.id}
          audioPath={vocabulary.audioPath}
          className="w-full"
        />

        {/* Record pronunciation */}
        <MicroRecordingButton
          vocabId={vocabulary.id}
          targetWord={vocabulary.word}
          onRecordingComplete={handleRecordingComplete}
          className="w-full"
        />
      </div>
    </div>
  );
}