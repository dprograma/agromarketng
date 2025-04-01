"use client";

import { WithAuth } from '@/components/auth/WithAuth';
import CustomerNavbar from '@/components/CustomerNavbar';

function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex min-h-screen">
        <CustomerNavbar />
        <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50">
          <main className="flex-grow p-4 bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default WithAuth(DashboardRootLayout);