// src/app/AppProviders.tsx
'use client';

import { ReactNode } from 'react';
// Nếu bạn có AuthProvider hay QueryClientProvider thì bọc ở đây

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}