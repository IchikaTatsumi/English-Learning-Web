'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/auth.hook';
import { Role } from '@/lib/constants/enums';
import { Spinner } from '@/components/ui/spinner';
import { authStorage } from '@/lib/utils/local-storage';

interface AuthenticatedProps {
  children: React.ReactNode;
  params?: {
    role?: Role;
  };
}

export function Authenticated({ children, params }: AuthenticatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, fetchIdentity, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // 1. Wait for auth initialization
        if (!isInitialized) {
          return;
        }

        // 2. Check token
        const token = authStorage.getAccessToken();

        if (!token) {
          console.log('❌ No token found, redirecting to login');
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/login?returnUrl=${returnUrl}`);
          return;
        }

        // 3. Fetch user if not loaded
        if (!user) {
          console.log('🔄 Fetching user identity...');
          try {
            const response = await fetchIdentity();
            
            if (!response.success || !response.data) {
              throw new Error('Failed to fetch user');
            }

            // ✅ Wait for next render cycle to process new user
            return;
          } catch (error) {
            console.error('❌ Session expired:', error);
            await logout();
            router.replace('/login');
            return;
          }
        }

        // 4. User loaded - check role permission
        if (params?.role) {
          const hasRequiredRole = user.role === params.role;
          
          if (!hasRequiredRole) {
            console.log('❌ Insufficient permissions');
            // Redirect based on actual role
            if (user.role === Role.ADMIN) {
              router.replace('/dashboard/home');
            } else {
              router.replace('/main/home');
            }
            return;
          }
        }

        // 5. ✅ All checks passed
        console.log('✅ Authentication successful');
        if (isMounted) {
          setIsChecking(false);
        }

      } catch (error) {
        console.error('❌ Auth check error:', error);
        if (isMounted) {
          router.replace('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isInitialized, user, params?.role, pathname, router, fetchIdentity, logout]);

  // Show loading spinner
  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}