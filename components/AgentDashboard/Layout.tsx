"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/SessionWrapper";
import {
  LayoutDashboard,
  MessageSquare,
  TicketCheck,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  Users,
  Menu,
  X,
  Bell,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const AGENT_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/agent/dashboard?tab=overview",
    icon: LayoutDashboard,
  },
  {
    title: "Chat Management",
    href: "/agent/dashboard?tab=chats",
    icon: MessageSquare,
  },
  {
    title: "Ticket Management",
    href: "/agent/dashboard?tab=tickets",
    icon: TicketCheck,
  },
  {
    title: "Knowledge Base",
    href: "/agent/dashboard?tab=knowledge",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/agent/dashboard?tab=analytics",
    icon: BarChart2,
  },
  {
    title: "Settings",
    href: "/agent/dashboard?tab=settings",
    icon: Settings,
  },
];

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingChats, setPendingChats] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { session, setSession } = useSession();

  // Fetch pending chats and tickets count
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        // Fetch pending chats
        const chatsResponse = await fetch("/api/agent/chats?status=pending", {
          credentials: "include",
        });
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          setPendingChats(chatsData.length);
        }

        // Fetch pending tickets
        const ticketsResponse = await fetch("/api/agent/tickets?status=pending", {
          credentials: "include",
        });
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          setPendingTickets(ticketsData.length);
        }
      } catch (error) {
        console.error("Error fetching pending items:", error);
      }
    };

    if (session) {
      fetchPendingItems();
      // Set up interval to refresh data
      const interval = setInterval(fetchPendingItems, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

  // Handle agent status change
  const handleStatusChange = async (status: boolean) => {
    try {
      setIsOnline(status);
      const response = await fetch("/api/agent/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline: status }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`You are now ${status ? "online" : "offline"}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      setIsOnline(!status); // Revert on failure
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Clear session from context
      setSession(null);

      // Clear all auth-related cookies
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        if (cookieName.includes("next-auth")) {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname}`;
          // Also try without domain for local development
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
      }

      // Call the API to clear server-side session
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and title */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-green-600">Agent Portal</h1>
              <div className="flex items-center space-x-2">
                <Label htmlFor="online-status" className={isOnline ? "text-green-600" : "text-gray-400"}>
                  {isOnline ? "Online" : "Offline"}
                </Label>
                <Switch
                  id="online-status"
                  checked={isOnline}
                  onCheckedChange={handleStatusChange}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {AGENT_NAV_ITEMS.map((item) => {
              // Add badge for pending items
              let badge = null;
              if (item.title === "Chat Management" && pendingChats > 0) {
                badge = (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingChats}
                  </Badge>
                );
              } else if (item.title === "Ticket Management" && pendingTickets > 0) {
                badge = (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingTickets}
                  </Badge>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                    pathname === item.href ||
                      (pathname === "/agent/dashboard" &&
                        item.href.includes(
                          `?tab=${new URLSearchParams(
                            pathname.includes("?") ? pathname.split("?")[1] : ""
                          ).get("tab") || "overview"
                          }`
                        ))
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                  {badge}
                </Link>
              );
            })}
          </nav>

          {/* User profile and logout */}
          <div className="p-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users size={20} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{session?.name || "Agent"}</p>
                  <p className="text-xs text-gray-500">{session?.email || ""}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-auto">
                      <Bell size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="right" className="w-56">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {pendingChats > 0 ? (
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{pendingChats} pending chats</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>No pending chats</span>
                      </DropdownMenuItem>
                    )}
                    {pendingTickets > 0 ? (
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{pendingTickets} pending tickets</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>No pending tickets</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                variant="outline"
                className="flex items-center justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
