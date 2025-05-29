"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/SessionWrapper";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Users,
  MessageSquare,
  Menu,
  X,
  LineChart,
} from "lucide-react";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { setSession } = useSession();

  // Custom navigation items with direct links to dashboard tabs
  const customNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Agents",
      href: "/admin/agents",
      icon: Users,
    },
    {
      title: "Chats",
      href: "/admin/dashboard?tab=chat",
      icon: MessageSquare,
    },
    {
      title: "Analytics",
      href: "/admin/dashboard?tab=analytics",
      icon: LineChart,
    },
    {
      title: "Settings",
      href: "/admin/dashboard?tab=settings",
      icon: Settings,
    },
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Nav Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-green-600"><Link href="/">AgroMarket</Link></h1>
            <p className="text-sm text-gray-500">Admin Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {customNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                  pathname === item.href ||
                    (pathname === "/admin/dashboard" && item.href.includes(`?tab=${new URLSearchParams(pathname.includes("?") ? pathname.split("?")[1] : "").get("tab") || "dashboard"}`))
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users size={16} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@agromarket.com</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "lg:ml-64 min-h-screen transition-all duration-200",
        isOpen ? "ml-64" : "ml-0"
      )}>
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}