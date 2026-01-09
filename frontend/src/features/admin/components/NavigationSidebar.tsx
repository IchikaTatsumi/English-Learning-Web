'use client';

import { cn } from '@/lib/utils';
import { Home, BookOpen, Brain, TrendingUp, GraduationCap, Users, FolderTree } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Role } from '@/lib/constants/enums';
import { useAuth } from '@/features/auth/hooks/auth.hook';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string; // Base href suffix (e.g., '/home' instead of '/dashboard/home')
  roles?: Role[];
  isAdminRoute?: boolean; // Flag to indicate purely admin routes
}

const navigationItems: NavigationItem[] = [
  { 
    id: 'home', 
    label: 'Home', 
    icon: Home, 
    href: '/home' 
  },
  { 
    id: 'vocabulary', 
    label: 'Vocabulary', 
    icon: BookOpen, 
    href: '/vocabularies' 
  },
  { 
    id: 'quiz', 
    label: 'Quiz', 
    icon: Brain, 
    href: '/quiz' 
  },
  { 
    id: 'progress', 
    label: 'Progress', 
    icon: TrendingUp, 
    href: '/progress' 
  },
  { 
    id: 'learned', 
    label: 'Learned', 
    icon: GraduationCap, 
    href: '/learned' 
  },
  // Admin only sections
  { 
    id: 'users', 
    label: 'User Management', 
    icon: Users, 
    href: '/usermanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true
  },
  { 
    id: 'topics', 
    label: 'Topic Management', 
    icon: FolderTree, 
    href: '/topicmanagement',
    roles: [Role.ADMIN],
    isAdminRoute: true
  },
];

export function NavigationSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Determine role and base path
  const userRole = user?.role === 'Admin' ? Role.ADMIN : Role.USER;
  const basePath = userRole === Role.ADMIN ? '/dashboard' : '/main';

  // Filter items based on role
  const filteredItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold">
          <span className="text-blue-600">Fast</span>
          <span className="text-gray-800">Learning</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            
            // Construct full path logic
            // Admin specific routes (users, topics) are always in /dashboard
            // Shared routes (home, quiz) depend on the user role (dashboard/home vs main/home)
            const fullPath = item.isAdminRoute 
              ? `/dashboard${item.href}`
              : `${basePath}${item.href}`;

            const isActive = pathname === fullPath;
            
            return (
              <li key={item.id}>
                <Link
                  href={fullPath}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

      {/* Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <ProfileDropdown onProfileClick={() => {
          window.location.href = `${basePath}/profile`;
        }} />
      </div>
    </div>
  );
}