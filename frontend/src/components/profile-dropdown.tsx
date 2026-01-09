'use client';

import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth';
import { useProgress } from '@/features/progress/hooks/progress.hook'; // ✅ Import Hook Progress
import { User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  onProfileClick?: () => void;
}

export function ProfileDropdown({ onProfileClick }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const { stats, fetchStats, isLoading } = useProgress(); // ✅ Lấy stats từ server
  const router = useRouter();

  // ✅ Fetch dữ liệu thống kê khi mount component
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

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

  // ✅ Tính toán Level dựa trên dữ liệu thật
  const totalPoints = stats?.quiz_score || 0;
  const learnedWords = stats?.learned_words || 0;
  
  // Logic tính level đơn giản (có thể tùy chỉnh)
  let level = 'Beginner';
  if (totalPoints > 1000 || learnedWords > 200) level = 'Advanced';
  else if (totalPoints > 500 || learnedWords > 50) level = 'Intermediate';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2 h-auto rounded-lg hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500">
        <Avatar className="h-8 w-8 bg-linear-to-br from-blue-500 to-indigo-600">
          <AvatarFallback className="bg-transparent text-white font-semibold">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-medium">{user.fullName}</span>
          <span className="text-xs text-gray-500 truncate w-32">{user.email}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2 bg-gray-50/50">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-gray-500 mb-2">{user.email}</p>
          
          {/* ✅ Hiển thị thông tin thống kê thật */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Points:</span>
            <span className="font-semibold text-blue-600">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : totalPoints}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600">Level:</span>
            <span className="font-medium text-purple-600">{level}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}