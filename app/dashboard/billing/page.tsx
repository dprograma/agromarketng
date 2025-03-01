"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from "next/dynamic";

// Lazy load BillingMain to reduce initial JS bundle size
const BillingMain = dynamic(() => import("@/components/BillingMain"), { ssr: false });



export default function Billing() {
    const session = useSession() as Session | null;
    const router = useRouter();
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        if (session !== undefined) {
            setIsCheckingSession(false);
        }
    }, [session]);

    useEffect(() => {
        if (!isCheckingSession && !session) {
            router.replace("/signin");
        }
    }, [isCheckingSession, session, router]);

    if (isCheckingSession) {
        return <p>Loading...</p>;
    }


    return (
        <DashboardLayout>
            <BillingMain />
        </DashboardLayout>
    );
}
