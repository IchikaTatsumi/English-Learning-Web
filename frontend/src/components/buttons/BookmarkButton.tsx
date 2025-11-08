'use client';

import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BookmarkButtonProps {
  vocabId: number;
  isBookmarked: boolean;
  onToggle: (vocabId: number, isBookmarked: boolean) => void;
}

export function BookmarkButton({ vocabId, isBookmarked: initialBookmarked, onToggle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleClick = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    onToggle(vocabId, newState);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
}