'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
import { MicroRecordingButton, RecognitionResult } from '@/components/buttons/MicroRecordingButton';
import { Loader2, Mic, BookOpen, Volume2, Trophy } from 'lucide-react';
import { toast } from '@/lib/utils/toast';

// Định nghĩa kiểu dữ liệu cho từ vựng trong danh sách Learned
// (Cần đảm bảo DTO khớp với backend trả về)
interface LearnedVocab {
  vocab_id: number;
  word: string;
  meaning_en: string;
  meaning_vi: string;
  ipa?: string;
  topic_name?: string;
  difficulty_level?: string;
  is_bookmarked?: boolean;
}

export function LearnedUI() {
  // State quản lý danh sách từ
  const { bookmarkedVocabularies, fetchBookmarkedVocabularies, isLoading } = useVocabularyProgress();
  
  // State quản lý Popup luyện tập
  const [selectedVocab, setSelectedVocab] = useState<LearnedVocab | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lấy danh sách từ đã Bookmark khi component mount
  useEffect(() => {
    fetchBookmarkedVocabularies();
  }, [fetchBookmarkedVocabularies]);

  // Hàm mở Popup
  const handleOpenPractice = (vocab: any) => {
    setSelectedVocab(vocab);
    setIsDialogOpen(true);
  };

  // Hàm xử lý khi luyện tập xong (Callback từ MicroButton)
  const handlePracticeComplete = (result: RecognitionResult) => {
    if (result.isCorrect) {
      toast.success("Tuyệt vời! Bạn đã phát âm chuẩn. 🎉");
      // Có thể thêm logic đóng popup sau 2s nếu muốn
      // setTimeout(() => setIsDialogOpen(false), 2000);
    } else {
      toast.error("Chưa chính xác lắm, hãy thử lại nhé!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Đang tải bộ sưu tập của bạn...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-blue-900">Learned Vocabulary</h1>
        <p className="text-slate-600">Ôn tập lại các từ vựng bạn đã lưu (Bookmarked).</p>
      </div>

      {bookmarkedVocabularies.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Chưa có từ vựng nào</h3>
          <p className="text-slate-500 mb-6">Hãy quay lại tab Vocabulary và bookmark những từ bạn muốn học.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarkedVocabularies.map((vocab: any) => (
            <Card key={vocab.vocab_id} className="hover:shadow-md transition-all flex flex-col h-full border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    {vocab.topic_name || 'General'}
                  </Badge>
                  {vocab.difficulty_level && (
                    <Badge variant="outline" className="text-xs">
                      {vocab.difficulty_level}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 pt-2">
                  {vocab.word}
                </CardTitle>
                {vocab.ipa && <p className="text-sm font-mono text-slate-500">{vocab.ipa}</p>}
              </CardHeader>
              
              <CardContent className="flex-grow space-y-2">
                <p className="text-slate-700 font-medium">{vocab.meaning_en}</p>
                <p className="text-slate-500 text-sm italic">{vocab.meaning_vi}</p>
              </CardContent>

              <CardFooter className="pt-4 border-t bg-slate-50/50">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm"
                  onClick={() => handleOpenPractice(vocab)}
                >
                  <Mic className="h-4 w-4" /> Practice Pronounce
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* POPUP LUYỆN TẬP (DIALOG) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-blue-900">
              <Trophy className="h-5 w-5 text-yellow-500" /> Luyện phát âm
            </DialogTitle>
            <DialogDescription>
              Hãy đọc to từ vựng bên dưới. Hệ thống sẽ chấm điểm giọng nói của bạn.
            </DialogDescription>
          </DialogHeader>

          {selectedVocab && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              {/* Hiển thị từ vựng to rõ */}
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-extrabold text-blue-600 tracking-tight">
                  {selectedVocab.word}
                </h2>
                {selectedVocab.ipa && (
                  <p className="text-lg text-slate-400 font-mono">{selectedVocab.ipa}</p>
                )}
              </div>

              {/* Nút Micro để thu âm */}
              <div className="w-full flex justify-center">
                <MicroRecordingButton
                  vocabId={selectedVocab.vocab_id} // Truyền ID để backend log kết quả
                  targetWord={selectedVocab.word}  // Truyền từ mẫu để backend so sánh
                  onRecordingComplete={handlePracticeComplete} // Callback hiển thị kết quả
                  className="px-8 py-4 text-lg rounded-full shadow-lg transition-transform active:scale-95"
                />
              </div>

              <div className="text-xs text-slate-400 text-center px-8">
                Mẹo: Nhấn nút Micro, nói rõ ràng, sau đó nhấn nút Stop (hoặc đợi) để nhận kết quả.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}