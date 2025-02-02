"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import MessagesMain from '@/components/MessagesMain';



export default function AdsPromtion() {
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
                        <MessagesMain />
                    </DashboardLayout>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
