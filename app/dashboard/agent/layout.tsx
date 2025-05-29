"use client";

import { WithAuth } from '@/components/auth/WithAuth';
import AgentDashboardLayout from '@/components/AgentDashboard/Layout';

// This layout completely overrides the parent layout to remove the CustomerNavbar
// and use the agent-specific layout instead
function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentDashboardLayout>
      {children}
    </AgentDashboardLayout>
  );
}

export default WithAuth(AgentLayout);
