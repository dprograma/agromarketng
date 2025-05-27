"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import {
    LogOut,
    Menu,
    X,
    Bell,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react";
import { NAV_ITEMS, SETTINGS } from "@/constants";
import { useUnreadNotifications } from "@/lib/hooks/useUnreadNotifications";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

// Socket connection pool
const socketPool = new Map<string, Socket>();

export default function CustomerNavbar() {
    const pathname = usePathname();
    const { session, setSession } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Use our custom hooks for notifications
    const { unreadCount: unreadNotifications, refreshUnreadCount } = useUnreadNotifications();
    const { notifications: allNotifications, refreshNotifications } = useNotifications();

    // Memoize recent notifications
    const recentNotifications = useMemo(() =>
        allNotifications?.slice(0, 3) || [],
        [allNotifications]
    );

    // Memoize current tab
    const currentTab = useMemo(() => {
        if (pathname === "/dashboard") return "dashboard";
        if (pathname.includes("?tab=")) {
            return pathname.split("?tab=")[1];
        }
        return pathname.split("/").pop();
    }, [pathname]);

    // Initialize socket connection for real-time notifications
    useEffect(() => {
        if (!session?.token) return;

        const socketKey = session.token;

        // Check if socket already exists in pool
        if (socketPool.has(socketKey)) {
            socketRef.current = socketPool.get(socketKey)!;
            return;
        }

        // Create new socket connection
        const socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
            path: '/api/socketio',
            auth: { token: session.token },
            transports: ['websocket'],
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 5000
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket for notifications');
        });

        socket.on('notification_received', (notification) => {
            refreshUnreadCount();
            refreshNotifications();
            toast.success(notification.message, {
                duration: 5000,
                icon: '🔔'
            });
        });

        // Add to pool and store reference
        socketPool.set(socketKey, socket);
        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketPool.delete(socketKey);
            }
        };
    }, [session?.token, refreshUnreadCount, refreshNotifications]);

    const handleLogout = useCallback(async () => {
        try {
            setIsLoggingOut(true);
            setSession(null);

            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
                const cookieName = cookie.split("=")[0].trim();
                if (cookieName.includes("next-auth")) {
                    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname}`;
                    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                }
            });

            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketPool.delete(session?.token || '');
            }

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            router.push('/signin');
            toast.success("Logged out successfully");
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Failed to log out");
        } finally {
            setIsLoggingOut(false);
        }
    }, [session?.token, setSession, router]);

    // Memoize notification icon getter
    const getNotificationIcon = useCallback((type: string) => {
        switch (type) {
            case "ad": return <CheckCircle size={16} className="text-green-600" />;
            case "promotion": return <Clock size={16} className="text-yellow-600" />;
            case "payment": return <CheckCircle size={16} className="text-blue-600" />;
            case "payment-failed": return <XCircle size={16} className="text-red-600" />;
            default: return <AlertCircle size={16} className="text-gray-600" />;
        }
    }, []);

    // Memoize navigation items
    const navItems = useMemo(() =>
        NAV_ITEMS.filter(item => !item.adminOnly || session?.role === "admin"),
        [session?.role]
    );

    return (
        <div className="flex h-screen bg-green-700">
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
                    "fixed inset-y-0 left-0 z-40 w-64 bg-green-700 shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo and title */}
                    <div className="p-4 border-b border-green-600">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-white">
                                <Link href="/">AgroMarket</Link>
                            </h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.route ||
                                (pathname === "/dashboard" && item.route === "/dashboard") ||
                                (pathname === "/dashboard" && item.route.includes(`/dashboard/${currentTab}`));

                            const badge = item.name === "Notifications" && unreadNotifications > 0 ? (
                                <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadNotifications}
                                </span>
                            ) : null;

                            return (
                                <Link
                                    key={item.route}
                                    href={item.route as string}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                                        isActive
                                            ? "bg-green-600 text-white"
                                            : "text-green-100 hover:bg-green-600 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                    {badge}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Settings */}
                    <div className="p-4 border-t border-green-600">
                        {SETTINGS.map((item) => (
                            item.action ? (
                                <button
                                    key={item.name}
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm text-green-100 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </button>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.route as string}
                                    className="flex items-center px-4 py-3 text-sm text-green-100 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
