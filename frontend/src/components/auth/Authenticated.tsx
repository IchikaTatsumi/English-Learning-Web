'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/auth.hook';
import { Role } from '@/lib/constants/enums';
import { Spinner } from '@/components/ui/spinner';
import { authStorage } from '@/lib/utils/local-storage'; // ✅ Import authStorage để check token

interface AuthenticatedProps {
  children: React.ReactNode;
  params?: {
    role?: Role;
  };
}

export function Authenticated({ children, params }: AuthenticatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  // ✅ Lấy thêm logout để xử lý khi token hết hạn
  const { user, isInitialized, fetchIdentity, logout } = useAuth(); 
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Chờ auth khởi tạo từ localStorage xong
      if (!isInitialized) return;

      // 2. Kiểm tra Token trong Storage (Thay vì dùng isAuthenticated)
      const token = authStorage.getAccessToken();

      if (!token) {
        // Không có token -> Đá về login
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      // 3. Có token nhưng chưa có User (VD: Reload trang) -> Fetch API
      if (!user) {
        try {
          await fetchIdentity();
          // Sau khi fetch xong, code sẽ chạy lại useEffect do dependency [user] thay đổi
          // nên ta return để vòng lặp sau xử lý tiếp logic phân quyền
          return; 
        } catch (error) {
          console.error('Session expired or invalid:', error);
          await logout(); // Xóa token rác
          router.push('/login');
          return;
        }
      }

      // 4. Đã có User -> Kiểm tra quyền (Role)
      if (params?.role && user) {
        const hasRequiredRole = user.role === params.role;
        
        if (!hasRequiredRole) {
          // Điều hướng dựa trên role hiện tại của user
          if (user.role === Role.ADMIN) {
            router.push('/dashboard/home');
          } else {
            router.push('/main/home');
          }
          return;
        }
      }

      // 5. Mọi thứ ok -> Hiển thị nội dung
      setIsChecking(false);
    };

    checkAuth();
  }, [isInitialized, user, params, router, pathname, fetchIdentity, logout]);

  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
           <Spinner />
           <p className="text-sm text-gray-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}