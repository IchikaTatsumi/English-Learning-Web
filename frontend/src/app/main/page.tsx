'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainRootPage() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Redirect to correct user home
    router.push('/main/home');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-500">Redirecting to Home...</div>
    </div>
  );
}