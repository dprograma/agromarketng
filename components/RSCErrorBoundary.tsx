"use client";

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RSCErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('RSC Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's an RSC payload error
    if (error.message?.includes('RSC payload') || 
        error.message?.includes('NetworkError')) {
      // Try to reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              {this.state.error?.message?.includes('NetworkError') || 
               this.state.error?.message?.includes('RSC payload')
                ? "There was a network issue. The page will reload automatically."
                : "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Reload Page
              </Button>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
