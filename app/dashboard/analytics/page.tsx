"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import AnalyticsMain from '@/components/AnalyticsMain';
import { useEffect } from "react";


export default function Analytics() {
    const session = useSession() as Session | null;
    const router = useRouter();

    useEffect(() => {
        if (!session) {
        router.push("/signin");
    }
    }, [session, router]);  

    return (
        <div>
            {session ? (
                <>
                    <DashboardLayout>
                        <AnalyticsMain />
                    </DashboardLayout>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
