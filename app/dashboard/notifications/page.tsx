"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationsMain from '@/components/NotificationsMain';
import { useEffect } from "react";


export default function Notifications() {
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
                        <NotificationsMain />
                    </DashboardLayout>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
