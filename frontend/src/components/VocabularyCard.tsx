import React from 'react';
// ❌ Đã xóa import LoudSpeakerButton
import { MicroRecordingButton, RecognitionResult } from './buttons/MicroRecordingButton';

interface VocabularyCardProps {
  vocabulary: {
    id: number;
    word: string;
    meaningEn: string;
    meaningVi: string;
    // ❌ Đã xóa audioPath vì backend không còn trả về
  };
}

export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const handleRecordingComplete = (result: RecognitionResult) => {
    console.log('Recording result:', result);
    // Handle result (update UI, save progress, etc.)
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      {/* Word and meanings */}
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-2">{vocabulary.word}</h3>
        <p className="text-lg text-gray-700 font-medium">{vocabulary.meaningEn}</p>
        <p className="text-gray-500 italic">{vocabulary.meaningVi}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* ❌ Đã bỏ nút Loa (Play pronunciation) */}

        {/* Record pronunciation (Chỉ giữ lại nút thu âm) */}
        <MicroRecordingButton
          vocabId={vocabulary.id}
          targetWord={vocabulary.word}
          onRecordingComplete={handleRecordingComplete}
          className="w-full py-6 text-lg bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
        />
        <p className="text-xs text-center text-gray-400 mt-1">
        </p>
      </div>
    </div>
  );
}