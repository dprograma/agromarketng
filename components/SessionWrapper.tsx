'use client';
import { createContext, useContext } from 'react';

const SessionContext = createContext(null);

export const useSession = () => useContext(SessionContext);

export default function SessionWrapper({ children, session }: any) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
