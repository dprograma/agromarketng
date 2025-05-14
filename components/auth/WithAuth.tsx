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
      const checkAuth = async () => {
        if (!session) {
          router.replace('/signin');
          return;
        }

        const role = session.role;
        const isAgentPath = pathname.startsWith('/agent/dashboard') || pathname.startsWith('/dashboard/agent');
        const isAdminPath = pathname.startsWith('/admin');

        if (isAgentPath && role !== 'agent') {
          router.replace(role === 'admin' ? '/admin/dashboard' : '/dashboard');
        } else if (isAdminPath && role !== 'admin') {
          router.replace(role === 'agent' ? '/agent/dashboard' : '/dashboard');
        } else if (!isAgentPath && !isAdminPath && role !== 'user') {
          router.replace(role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
        } else {
          setIsChecking(false);
        }
      };

      checkAuth();
    }, [session?.role, pathname]); // Only depend on role changes

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