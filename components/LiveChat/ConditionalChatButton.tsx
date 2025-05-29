"use client";

import { usePathname } from "next/navigation";
import LiveChatButton from "./LiveChatButton";
import { useSession } from "@/components/SessionWrapper";

export default function ConditionalChatButton() {
  const pathname = usePathname();
  const { session } = useSession();

  // Don't show chat button on admin or agent pages
  const isAdminPage = pathname.startsWith("/admin");
  const isAgentPage = pathname.startsWith("/agent");
  const isAdminUser = session?.role === "admin";
  const isAgentUser = session?.role === "agent";

  // Hide the chat button for admin/agent users or on admin/agent pages
  if (isAdminPage || isAgentPage || isAdminUser || isAgentUser) {
    return null;
  }

  // Show the chat button for regular users on regular pages
  return <LiveChatButton />;
}
