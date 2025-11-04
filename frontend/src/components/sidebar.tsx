'use client';

import { Home, BookOpen, Brain, TrendingUp, GraduationCap } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'learned', label: 'Learned', icon: GraduationCap },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-blue-600 font-bold text-xl">Fast<span className="text-gray-800">Learning</span></h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
