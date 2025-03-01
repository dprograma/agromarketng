// 'use client';
// import { createContext, useContext } from 'react';

// const SessionContext = createContext(null);

// export const useSession = () => useContext(SessionContext);

// export default function SessionWrapper({ children, session }: any) {
//   return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
// }

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types";

// Context for storing the session
const SessionContext = createContext<{ session: Session | null; setSession: (session: Session | null) => void } | null>(null);

// Custom hook to access session
export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within a SessionProvider");
    return context;
};

// Session Provider Component
const SessionWrapper = ({ children, session }: any) => {
    const [sessionState, setSessionState] = useState<Session | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for session data on page load
        const storedSession = localStorage.getItem("session");
        if (storedSession) {
            setSessionState(JSON.parse(storedSession));
        }
    }, []);

    const setSession = (newSession: Session | null) => {
        if (newSession) {
            localStorage.setItem("session", JSON.stringify(newSession));
        } else {
            localStorage.removeItem("session");
        }
        setSessionState(newSession);
    };

    return (
        <SessionContext.Provider value={{ session: sessionState, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionWrapper;