"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import Link from "next/link";
import Image from "next/image";
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

export default function CustomerNavbar() {
    const pathname = usePathname();
    const { session, setSession } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Initialize socket connection for real-time notifications
    useEffect(() => {
        if (session?.token) {
            // Initialize socket connection
            const socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
                path: '/api/socketio',
                auth: {
                    token: session.token
                },
                transports: ['websocket', 'polling'] // Explicitly specify transports
            });

            socket.on('connect', () => {
                console.log('Connected to WebSocket for notifications');
            });

            // Listen for real-time notifications
            socket.on('notification_received', (notification) => {
                console.log('New notification received:', notification);

                // Update unread count
                setUnreadNotifications(prev => prev + 1);

                // Add to recent notifications
                setRecentNotifications(prev => {
                    const updated = [notification, ...prev];
                    return updated.slice(0, 3); // Keep only the 3 most recent
                });

                // Show toast notification
                toast.success(notification.message, {
                    duration: 5000,
                    icon: '🔔'
                });
            });

            // Store socket reference
            socketRef.current = socket;

            return () => {
                socket.disconnect();
            };
        }
    }, [session]);

    // Fetch notifications data
    useEffect(() => {
        const fetchNotifications = async () => {
            if (session) {
                try {
                    // Fetch unread count
                    const unreadResponse = await fetch("/api/user/notifications/unread", {
                        credentials: "include",
                    });

                    if (unreadResponse.ok) {
                        const unreadData = await unreadResponse.json();
                        setUnreadNotifications(unreadData.count || 0);
                    }

                    // Fetch recent notifications for dropdown
                    const recentResponse = await fetch("/api/user/notifications", {
                        credentials: "include",
                    });

                    if (recentResponse.ok) {
                        const recentData = await recentResponse.json();
                        // Get the 3 most recent notifications
                        setRecentNotifications(recentData.notifications.slice(0, 3));
                    }
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                }
            }
        };

        fetchNotifications();
        // Set up interval to refresh data every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [session]);

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
            toast.success("Logged out successfully");
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Failed to log out");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Get current tab from URL
    const getCurrentTab = () => {
        if (pathname === "/dashboard") return "dashboard";
        if (pathname.includes("?tab=")) {
            return pathname.split("?tab=")[1];
        }
        return pathname.split("/").pop();
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "ad":
                return <CheckCircle size={16} className="text-green-600" />;
            case "promotion":
                return <Clock size={16} className="text-yellow-600" />;
            case "payment":
                return <CheckCircle size={16} className="text-blue-600" />;
            case "payment-failed":
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <AlertCircle size={16} className="text-gray-600" />;
        }
    };

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
                        {NAV_ITEMS.filter(item => !item.adminOnly || session?.role === "admin").map((item) => {
                            // Add badge for notifications
                            let badge = null;
                            if (item.name === "Notifications" && unreadNotifications > 0) {
                                badge = (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {unreadNotifications}
                                    </span>
                                );
                            }

                            const isActive =
                                pathname === item.route ||
                                (pathname === "/dashboard" && item.route === "/dashboard") ||
                                (pathname === "/dashboard" &&
                                    item.route.includes(`/dashboard/${getCurrentTab()}`));

                            return (
                                <Link
                                    key={item.route}
                                    href={item.route}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                                        isActive
                                            ? "bg-green-800 text-white"
                                            : "text-white hover:bg-green-800"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                    {badge}
                                </Link>
                            );
                        })}

                        {/* Settings Links */}
                        {SETTINGS.filter(item => item.action !== "logout").map((item) => {
                            const isActive = pathname === item.route;

                            return (
                                <Link
                                    key={item.route}
                                    href={item.route || "#"}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                                        isActive
                                            ? "bg-green-800 text-white"
                                            : "text-white hover:bg-green-800"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User profile and logout */}
                    <div className="p-4 border-t border-green-600">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center">
                                {session?.image ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <img
                                            src={session.image}
                                            alt={session.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Users size={20} className="text-green-600" />
                                    </div>
                                )}
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white">{session?.name || "User"}</p>
                                    <p className="text-xs text-green-300">{session?.email || ""}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="ml-auto text-white">
                                            <Bell size={18} />
                                            {unreadNotifications > 0 && (
                                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                                                    {unreadNotifications}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="right" className="w-72">
                                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        {recentNotifications.length > 0 ? (
                                            <>
                                                {recentNotifications.map((notification) => (
                                                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
                                                        <div className="flex items-center w-full">
                                                            {getNotificationIcon(notification.type)}
                                                            <span className="ml-2 text-sm font-medium truncate max-w-[200px]">
                                                                {notification.message}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-1 ml-6">
                                                            {notification.time}
                                                        </span>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                            </>
                                        ) : (
                                            <div className="px-2 py-2 text-sm text-gray-500 text-center">
                                                No recent notifications
                                            </div>
                                        )}

                                        <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
                                            View all notifications
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Button
                                variant="outline"
                                className="flex items-center justify-center bg-transparent border-white text-white hover:bg-green-800 hover:text-white"
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

            {/* Main content will be rendered by the layout */}
        </div>
    );
}
