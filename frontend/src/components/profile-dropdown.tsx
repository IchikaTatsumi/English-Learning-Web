'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  onProfileClick?: () => void;
}

export function ProfileDropdown({ onProfileClick }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      router.push('/dashboard/profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  const totalPoints = 0; // Will be calculated from progress
  const level = totalPoints < 500 ? 'Beginner' : totalPoints < 1000 ? 'Intermediate' : 'Advanced';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2 h-auto rounded-lg hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500">
        <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600">
          <AvatarFallback className="bg-transparent text-white font-semibold">
            {user.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{user.full_name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <p className="text-xs text-blue-600 mt-1">Level: {level}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}