'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000, // 30 seconds
                gcTime: 5 * 60 * 1000, // 5 minutes
                retry: (failureCount, error: any) => {
                    // Don't retry on RSC payload errors
                    if (error?.message?.includes('RSC payload') || 
                        error?.message?.includes('NetworkError')) {
                        return false;
                    }
                    return failureCount < 2;
                },
                refetchOnWindowFocus: false,
                refetchOnMount: true,
                refetchOnReconnect: 'always',
            },
            mutations: {
                retry: false,
            }
        }
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
} 