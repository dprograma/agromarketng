"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        // Custom styles for different toast types
        success: {
          style: {
            border: '1px solid #22c55e',
            borderLeft: '8px solid #22c55e',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#FFFFFF',
          },
        },
        error: {
          style: {
            border: '1px solid #ef4444',
            borderLeft: '8px solid #ef4444',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#FFFFFF',
          },
        },
        loading: {
          style: {
            border: '1px solid #3b82f6',
            borderLeft: '8px solid #3b82f6',
          },
        },
      }}
    />
  );
}
