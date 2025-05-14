"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import AgentDashboard from "@/components/AgentDashboard/Dashboard";
import { Loader2 } from "lucide-react";

export default function AgentDashboardPage() {
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (session === null) {
      router.replace("/signin");
    } else if (session && session.role !== "agent") {
      // Redirect non-agents to their appropriate dashboard
      if (session.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Only render for agents
  if (session.role === "agent") {
    return <AgentDashboard defaultTab={tab} />;
  }

  return null;
}
