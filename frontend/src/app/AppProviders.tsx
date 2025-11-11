'use client';

import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App Providers
 * Wrap entire app with necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {/* Add other providers here if needed */}
      {/* Example: ThemeProvider, QueryClientProvider, etc. */}
      {children}
    </>
  );
}