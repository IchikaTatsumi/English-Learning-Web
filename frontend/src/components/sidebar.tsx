'use client';

import { Home, BookOpen, Brain, TrendingUp, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils'; // Sửa đường dẫn utils cho chuẩn
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Không cần Props activeTab nữa, vì ta tự check từ URL
export function Sidebar() {
  const pathname = usePathname();

  // Định nghĩa menu với đường dẫn thật (Real Routes)
  const navigationItems = [
    { href: '/main/home', label: 'Home', icon: Home },
    { href: '/main/vocabularies', label: 'Vocabulary', icon: BookOpen },
    { href: '/main/quiz', label: 'Quiz', icon: Brain },
    { href: '/main/progress', label: 'Progress', icon: TrendingUp },
    { href: '/main/learned', label: 'Learned', icon: GraduationCap },
  ];

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <Link href="/main/home">
          <h1 className="text-blue-600 font-bold text-xl cursor-pointer">
            Fast<span className="text-gray-800">Learning</span>
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            // Kiểm tra xem URL hiện tại có bắt đầu bằng href của item không
            const isActive = pathname?.startsWith(item.href);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Optional: User Profile Summary at bottom */}
      <div className="p-4 border-t border-border">
         <div className="text-xs text-gray-400 text-center">
            v1.0.0
         </div>
      </div>
    </div>
  );
}