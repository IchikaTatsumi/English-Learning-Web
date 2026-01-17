'use client';

import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  GraduationCap, 
  Users, 
  FolderTree, 
  Languages,      // Icon cho Vocabulary Management
  ClipboardCheck  // Icon cho Quiz Management
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Role } from '@/lib/constants/enums';
import { useAuth } from '@/features/auth/hooks/auth.hook';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles?: Role[];
  isAdminRoute?: boolean;
}

const navigationItems: NavigationItem[] = [
  // --- USER PREVIEW SECTION ---
  { id: 'home', label: 'Home', icon: Home, href: '/home' },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen, href: '/vocabularies' },
  { id: 'quiz', label: 'Quiz', icon: Brain, href: '/quiz' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, href: '/progress' },
  { id: 'learned', label: 'Learned', icon: GraduationCap, href: '/learned' },

  // --- ADMIN MANAGEMENT SECTION (ADD NEW BUTTONS HERE) ---
  { 
    id: 'vocabulary-mgmt', 
    label: 'Vocabulary Mgmt', 
    icon: Languages, 
    href: '/vocabularymanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true // Sẽ được nối thành /dashboard/vocabularymanagement
  },
  { 
    id: 'quiz-mgmt', 
    label: 'Quiz Management', 
    icon: ClipboardCheck, 
    href: '/quizmanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true // Sẽ được nối thành /dashboard/quizmanagement
  },
  { 
    id: 'topics', 
    label: 'Topic Management', 
    icon: FolderTree, 
    href: '/topicmanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true
  },
  { 
    id: 'users', 
    label: 'User Management', 
    icon: Users, 
    href: '/usermanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true
  },
];

export function NavigationSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Kiểm tra Role chính xác (không phân biệt hoa thường để tránh lỗi dữ liệu)
  const userRole = user?.role?.toLowerCase() === 'admin' ? Role.ADMIN : Role.USER;
  const basePath = userRole === Role.ADMIN ? '/dashboard' : '/main';

  // Lọc các item dựa trên quyền truy cập
  const filteredItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold">
          <span className="text-blue-600">Fast</span>
          <span className="text-gray-800">Learning</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            
            // Logic quan trọng: Xác định đường dẫn đầy đủ
            const fullPath = item.isAdminRoute 
              ? `/dashboard${item.href}`
              : `${basePath}${item.href}`;

            // Kiểm tra Active trạng thái để hiển thị màu xanh
            const isActive = pathname === fullPath;
            
            return (
              <li key={item.id}>
                <Link
                  href={fullPath}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <ProfileDropdown onProfileClick={() => {
          window.location.href = `${basePath}/profile`;
        }} />
      </div>
    </div>
  );
}