"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from "next/dynamic";

// Lazy load ProfileMain to reduce initial JS bundle size
const ProfileMain = dynamic(() => import("@/components/ProfileMain"), { ssr: false });


export default function Profile() {
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
            <ProfileMain />
        </DashboardLayout>
    );
}
