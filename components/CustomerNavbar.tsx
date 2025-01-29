"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, MenuItem, MenuButton, MenuItems } from "@headlessui/react";
import { Home, PlusCircle, BarChart, DollarSign, User, LogOut, Settings, CreditCard, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import fallbackImg from "../public/assets/img/fallback.jpg";

export default function NavigationPanel() {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle window resize to update mobile state
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "POST",
            });
            if (response.ok) {
                // Redirect the user to the sign-in page
                router.push("/signin");
            } else {
                const data = await response.json();
                console.error("Failed to log out");
            }
        } catch (error) {
            console.error("An error occurred while logging out:", error);
        }
    };

    return (
        <div className={`${isCollapsed ? (isMobile ? "w-20" : "w-24" ): (isMobile ? "absolute w-72 z-50" : "w-72")}
            } bg-green-700 text-white min-h-screen transition-all duration-300 flex flex-col overflow-y-hidden`}>
            {/* Logo Section */}
            <div className="flex items-center justify-between px-4 py-3">
                {!isCollapsed && !isMobile && (
                    <h1 className="text-2xl font-bold">
                        <Link href="/">AgroMarket</Link>
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-white focus:outline-none"
                >
                    {isCollapsed ? "☰" : "✖"}
                </button>
            </div>

            {/* User Profile Section **/}
            <div className="px-4 py-3 border-t border-green-600 mb-7">
                <div className="flex justify-center items-center space-x-3">

                    {!isCollapsed ? (
                        <div> 
                            <Image
                                src={fallbackImg} 
                                alt="User Avatar"
                                width={40}
                                height={40}
                                className="rounded-full"
                            /><p className="font-semibold">John Doe</p>
                                <p className="text-sm text-green-300">johndoe@example.com</p>
                        </div>
                    ): (<>
                        <Image
                            src={fallbackImg} 
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    </>)}
                </div>
            </div>
            {/* Navigation Links */}
            <nav className="flex justify-center flex-grow">
                <ul className="flex flex-col item-center space-y-2 px-4">
                    {[
                        { name: "Dashboard", icon: <Home />, route: "/dashboard" },
                        { name: "My Ads", icon: <Megaphone />, route: "/dashboard/my-ads" },
                        { name: "Post New Ad", icon: <PlusCircle />, route: "/dashboard/new-ad" },
                        { name: "Ad Promotions", icon: <DollarSign />, route: "/dashboard/promotions" },
                        { name: "Analytics", icon: <BarChart />, route: "/dashboard/analytics" },
                    ].map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => router.push(item.route)}
                                className={`flex items-center p-2 rounded hover:bg-green-800 
                    ${isCollapsed ? "justify-center" : "gap-x-2"}`}
                            >
                                {item.icon}
                                {!isCollapsed && <span>{item.name}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>


            {/* User Profile and Actions */}
            <div className="px-4 py-3 border-t border-green-600 flex justify-center">
                <Menu as="div" className="relative mt-3">
                    <MenuButton className="p-2 rounded hover:bg-green-800 w-full flex justify-center space-x-2">
                    {/* p-2 rounded hover:bg-green-800 w-full flex justify-center */}
                        <Settings/>
                        {!isCollapsed && <span>Settings</span>}
                    </MenuButton>
                    <MenuItems className="relative left-0 mt-2 bg-green-800 text-white rounded shadow-lg w-full overflow-y-auto max-h-60 z-50 transition duration-200 ease-in-out transform origin-top">
                        {[
                            { name: "Profile Settings", icon: <User size={16} />, route: "/dashboard/profile" },
                            { name: "Payments & Billing", icon: <CreditCard size={16} />, route: "/dashboard/billing" },
                            { name: "Sign Out", icon: <LogOut size={16} />, action: handleLogout }
                        ].map((item, index) => (
                            <MenuItem key={index}>
                                {({ active }) => (
                                    <button
                                        onClick={item.action || (() => router.push(item.route))}
                                        className={`flex items-center w-full px-4 py-2 gap-x-2 ${active ? "bg-green-600 text-white" : "hover:bg-green-700"}`}
                                    >
                                         {item.icon}
                                         {!isCollapsed && <span>{item.name}</span>}
                                    </button>
                                )}
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Menu>

            </div>
        </div>
    );
}
