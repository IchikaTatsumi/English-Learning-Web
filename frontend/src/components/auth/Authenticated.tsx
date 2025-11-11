'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/auth.hook';
import { Role } from '@/lib/constants/enums';
import { Spinner } from '@/components/ui/spinner';

interface AuthenticatedProps {
  children: React.ReactNode;
  params?: {
    role?: Role;
  };
}

/**
 * Authenticated Component
 * Protects routes and checks user role
 */
export function Authenticated({ children, params }: AuthenticatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, fetchIdentity } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth to initialize
      if (!isInitialized) {
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Save intended destination
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      // Fetch user identity if not available
      if (!user) {
        try {
          await fetchIdentity();
        } catch (error) {
          console.error('Failed to fetch identity:', error);
          router.push('/login');
          return;
        }
      }

      // Check role if specified
      if (params?.role && user) {
        const hasRequiredRole = user.role === params.role;
        
        if (!hasRequiredRole) {
          // User doesn't have required role → redirect
          if (user.role === Role.ADMIN) {
            router.push('/dashboard/home');
          } else {
            router.push('/dashboard/home');
          }
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isInitialized, isAuthenticated, user, params, router, pathname, fetchIdentity]);

  // Show loading spinner while checking
  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}