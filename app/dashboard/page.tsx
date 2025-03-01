"use client";

import dynamic from "next/dynamic";

const DashboardMain = dynamic(() => import("@/components/DashboardMain"), { ssr: false });
const DashboardLayout = dynamic(() => import("@/components/DashboardLayout"), { ssr: false });

export default function Dashboard() {

    return (
            <DashboardLayout>
                <DashboardMain />
            </DashboardLayout>
    );
}
