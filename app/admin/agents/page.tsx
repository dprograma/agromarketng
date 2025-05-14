"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import AdminLayout from "@/components/AdminDashboard/Layout";
import AgentManagement from "@/components/AdminDashboard/AgentManagement";
import { Loader2 } from "lucide-react";


export default function AgentsPage() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      // Only redirect if we're sure there's no session
      router.replace("/signin");
    } else if (session && session.role !== "admin") {
      // Redirect non-admin users to their appropriate dashboard
      router.replace("/dashboard");
    }
  }, [session, router]);

  // Show loading while checking session
  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show error if user isn't admin
  if (session.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <AgentManagement />
    </AdminLayout>
  );
}