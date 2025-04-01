"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/SessionWrapper';
import Spinner from '@/components/Spinner';

export function WithAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthWrapper(props: P) {
    const { session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (session === null) {
        router.replace('/signin');
      } else if (session !== undefined) {
        setIsChecking(false);
      }
    }, [session]);

    // Cache the auth state
    useEffect(() => {
      if (!isChecking && session) {
        sessionStorage.setItem('isAuthenticated', 'true');
      }
    }, [isChecking, session]);

    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner className="w-8 h-8 text-green-600" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}