'use client';

import { Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookmarkButtonProps {
  vocabId: number;
  isBookmarked: boolean;
  isLoading?: boolean; // ✅ Thêm prop loading để hiện xoay xoay khi đang gọi API
  onToggle: (vocabId: number, currentStatus: boolean) => void;
  className?: string;  // Cho phép custom style từ bên ngoài
}

export function BookmarkButton({ 
  vocabId, 
  isBookmarked, 
  isLoading = false, 
  onToggle, 
  className = '' 
}: BookmarkButtonProps) {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn click lan ra thẻ cha (ví dụ khi click vào card)
    if (!isLoading) {
      onToggle(vocabId, isBookmarked);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={`hover:bg-transparent ${className}`}
      title={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      ) : (
        <Bookmark 
          className={`h-5 w-5 transition-colors duration-200 ${
            isBookmarked 
              ? 'fill-yellow-400 text-yellow-400' // Đã bookmark: Vàng đặc
              : 'text-gray-400 hover:text-yellow-400' // Chưa bookmark: Xám, hover vàng
          }`} 
        />
      )}
    </Button>
  );
}