'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AddButton({ 
  onClick, 
  label = 'Add', 
  variant = 'default',
  size = 'default',
  className 
}: AddButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      variant={variant}
      size={size}
      className={className}
    >
      <Plus className="h-4 w-4" />
      {size !== 'icon' && <span className="ml-2">{label}</span>}
    </Button>
  );
}