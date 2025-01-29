"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardMain from '@/components/DashboardMain';


export default function Dashboard() {
    const session = useSession() as Session | null;
    const router = useRouter();

    if (!session) {
        router.push("/signin");
    }

    return (
        <div>
            {session ? (
                <>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
