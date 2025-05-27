"use client";

import { WithAuth } from '@/components/auth/WithAuth';
import CustomerNavbar from '@/components/CustomerNavbar';
import { RSCErrorBoundary } from '@/components/RSCErrorBoundary';
import { memo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Try again
    </button>
  </div>
);

const DashboardRootLayout = memo(function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex min-h-screen">
        <CustomerNavbar />
        <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50">
          <RSCErrorBoundary>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<LoadingSpinner />}>
                <main className="flex-grow p-4 bg-gray-50">{children}</main>
              </Suspense>
            </ErrorBoundary>
          </RSCErrorBoundary>
        </div>
      </div>
    </div>
  );
});

export default WithAuth(DashboardRootLayout);