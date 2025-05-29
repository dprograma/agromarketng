"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// This page redirects to the new agent dashboard route
export default function AgentRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    // Redirect to the new agent dashboard route with the same tab parameter
    router.replace(`/agent/dashboard?tab=${tab}`);
  }, [router, tab]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      <span className="ml-2">Redirecting to new agent dashboard...</span>
    </div>
  );
}