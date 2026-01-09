'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'text-sm font-medium',
        style: {
          padding: '16px',
          color: '#333',
          background: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '8px',
        },
        success: {
          iconTheme: {
            primary: '#16a34a', // green-600
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #16a34a',
          }
        },
        error: {
          iconTheme: {
            primary: '#dc2626', // red-600
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #dc2626',
          }
        },
      }}
    />
  );
}