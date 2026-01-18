import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Volume2 } from 'lucide-react';
import { MicroRecordingButton, RecognitionResult } from './buttons/MicroRecordingButton';
import { toast } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

interface VocabularyCardProps {
  vocabulary: {
    vocab_id: number;
    word: string;
    ipa?: string;
    meaning_en: string;
    meaning_vi: string;
    example_sentence?: string;
    difficulty_level?: string;
    topic_name?: string;
    is_bookmarked?: boolean;
  };
  onBookmark?: (id: number) => void;
  isBookmarked?: boolean;
}

export function VocabularyCard({ vocabulary, onBookmark, isBookmarked }: VocabularyCardProps) {
  const handleRecordingComplete = (result: RecognitionResult) => {
    if (result.isCorrect) {
      toast.success('Phát âm chính xác! 🎉');
    } else {
      toast.error(`Chưa chính xác. Bạn nói: "${result.recognizedText}"`);
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 border-slate-200 group">
      {/* HEADER: Topic, Level & Bookmark */}
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-wrap gap-2">
          {vocabulary.topic_name && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">
              {vocabulary.topic_name}
            </Badge>
          )}
          {vocabulary.difficulty_level && (
            <Badge variant="outline" className={cn("font-medium border", getDifficultyColor(vocabulary.difficulty_level))}>
              {vocabulary.difficulty_level}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 -mr-2 -mt-2 transition-colors",
            isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-slate-300 hover:text-yellow-400"
          )}
          onClick={() => onBookmark?.(vocabulary.vocab_id)}
        >
          <Bookmark className={cn("h-5 w-5", isBookmarked ? "fill-current" : "")} />
        </Button>
      </CardHeader>

      {/* CONTENT: Word, IPA, Meanings */}
      <CardContent className="p-4 pt-2 flex-grow space-y-4">
        {/* Word & IPA */}
        <div className="text-center space-y-1 py-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{vocabulary.word}</h3>
          {vocabulary.ipa && (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span className="font-mono text-sm bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {vocabulary.ipa}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Meaning EN */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Meaning (EN)</span>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {vocabulary.meaning_en}
            </p>
          </div>

          {/* Meaning VN */}
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
            <span className="text-xs font-bold text-blue-400 uppercase block mb-1">Meaning (VN)</span>
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              {vocabulary.meaning_vi}
            </p>
          </div>

          {/* Example Sentence */}
          {vocabulary.example_sentence && (
            <div className="relative pl-3 mt-2">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full"></div>
              <p className="text-sm text-slate-600 italic">
                "{vocabulary.example_sentence}"
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* FOOTER: Micro Button */}
      <CardFooter className="p-4 pt-0 bg-white">
        <MicroRecordingButton
          vocabId={vocabulary.vocab_id}
          targetWord={vocabulary.word}
          onRecordingComplete={handleRecordingComplete}
          className="w-full bg-white border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all shadow-sm"
        />
      </CardFooter>
    </Card>
  );
}