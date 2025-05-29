"use client";

import { WithAuth } from '@/components/auth/WithAuth';
import AgentDashboardLayout from '@/components/AgentDashboard/Layout';

function AgentDashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AgentDashboardLayout>
      {children}
    </AgentDashboardLayout>
  );
}

export default WithAuth(AgentDashboardLayoutWrapper);
