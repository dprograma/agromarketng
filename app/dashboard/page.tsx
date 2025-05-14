"use client";

import { useSearchParams } from "next/navigation";
import EnhancedDashboardMain from "@/components/EnhancedDashboardMain";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  return <EnhancedDashboardMain defaultTab={tab} />;
}