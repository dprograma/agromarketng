"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import AdminLayout from "@/components/AdminDashboard/Layout";
import AdminDashboard from "@/components/AdminDashboard/Dashboard";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    if (session === null) {
      router.replace("/signin");
    } else if (session && session.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (session.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <AdminDashboard defaultTab={tab} />
    </AdminLayout>
  );
}