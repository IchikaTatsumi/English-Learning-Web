'use client';

import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'list';

interface ViewModeButtonProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeButton({ mode, onModeChange }: ViewModeButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('grid')}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}