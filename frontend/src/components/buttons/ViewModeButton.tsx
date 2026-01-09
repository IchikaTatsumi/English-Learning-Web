'use client';

import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Export type để các component khác (LearnedUI, VocabularyUI) dùng chung
export type ViewMode = 'grid' | 'list';

interface ViewModeButtonProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeButton({ mode, onModeChange }: ViewModeButtonProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <Button
        variant={mode === 'grid' ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onModeChange('grid')}
        title="Grid View"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'list' ? 'default' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onModeChange('list')}
        title="List View"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}