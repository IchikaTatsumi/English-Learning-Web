// src/app/(admin)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Tự động chuyển hướng về trang home của dashboard
    router.replace('/dashboard/home');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-500">Redirecting to Dashboard...</div>
    </div>
  );
}