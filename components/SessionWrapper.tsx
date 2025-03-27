"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types";

const SessionContext = createContext<{ 
  session: Session | null; 
  setSession: (session: Session | null) => void 
} | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
};

const getCookie = (name: string): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

const SessionWrapper = ({ children, session: initialSession }: { 
  children: React.ReactNode;
  session: Session | null;
}) => {
  const [sessionState, setSessionState] = useState<Session | null>(initialSession);
  const router = useRouter();

  // Update session state when initialSession changes
  useEffect(() => {
    if (initialSession) {
      setSessionState(initialSession);
    }
  }, [initialSession]);

  const setSession = (newSession: Session | null) => {
    if (newSession?.token) {
      // Update session state
      setSessionState(newSession);
    } else {
      // Clear session
      setSessionState(null);
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  };

  return (
    <SessionContext.Provider value={{ session: sessionState, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionWrapper;