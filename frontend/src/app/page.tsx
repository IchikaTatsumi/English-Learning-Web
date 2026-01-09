'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Redirect to login first. 
    // If authenticated, login page logic or middleware should handle redirection to /main/home or /dashboard/home
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}