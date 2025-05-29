"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Rocket,
  Zap,
  BarChart,
  Inbox,
  BookmarkCheck,
  Bell,
  User,
  CreditCard,
  HelpCircle,
  Loader2
} from "lucide-react";
import Spinner from "@/components/Spinner";
import EnhancedAnalyticsMain from "@/components/EnhancedAnalyticsMain";
import MessagesMain from "@/components/MessagesMain";
import CategoriesSavedSearchesMain from "@/components/CategoriesSavedSearchesMain";
import NotificationsMain from "@/components/NotificationsMain";
import ProfileMain from "@/components/ProfileMain";
import BillingMain from "@/components/BillingMain";
import SupportMain from "@/components/SupportMain";

interface EnhancedDashboardMainProps {
  defaultTab?: string;
}

export default function EnhancedDashboardMain({ defaultTab = "dashboard" }: EnhancedDashboardMainProps) {
  // State for mobile view and active tab
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    // Update the URL with the current tab without full page reload
    const url = new URL(window.location.href);
    if (activeTab === "dashboard") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", activeTab);
    }
    window.history.pushState({}, "", url.toString());
  }, [activeTab]);

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Title */}
      <header className="flex justify-between items-center mb-6">
        {!isMobile ? (<h1 className="text-3xl text-gray-500 font-bold">Dashboard</h1>) : (<h1 className="text-xl text-gray-500 font-bold">Dashboard</h1>)}
        <Button onClick={() => { setIsPosting(true); router.push("/dashboard/new-ad"); setIsPosting(false); }} className="flex bg-green-600 text-white hover:bg-green-700 text-sm">
          {!isMobile ? (<><Plus className="mr-2" /> {isPosting ? <Spinner /> : 'Post New Ad'}</>) : (<><Plus className="mr-2" /> <span className="text-sm">{isPosting ? <Spinner /> : 'Post New Ad'}</span></>)}
        </Button>
      </header>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="dashboard"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard")}
          >
            <BarChart className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=analytics")}
          >
            <BarChart className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=messages")}
          >
            <Inbox className="w-4 h-4" /> Messages
          </TabsTrigger>
          <TabsTrigger
            value="saved-searches"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=saved-searches")}
          >
            <BookmarkCheck className="w-4 h-4" /> Saved Searches
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=notifications")}
          >
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=profile")}
          >
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=billing")}
          >
            <CreditCard className="w-4 h-4" /> Billing
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard?tab=support")}
          >
            <HelpCircle className="w-4 h-4" /> Support
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Overview Tab */}
        <TabsContent value="dashboard">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Ad Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Active Ads:</span>
                        <span className="font-medium">12</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Views:</span>
                        <span className="font-medium">2,345</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Clicks:</span>
                        <span className="font-medium">523</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Boosted Ads:</span>
                        <span className="font-medium">4</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Promotion Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Promotion Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Ongoing Promotions:</span>
                        <span className="font-medium">2</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Earnings from Promotions:</span>
                        <span className="font-medium">₦125.00</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button onClick={() => router.push("/dashboard/promotions")} variant="outline" className="w-full flex items-center justify-center">
                        <Rocket className="mr-2" /> Boost Ads
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Zap className="mr-2" /> View Promotions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Feed */}
              <div className="space-y-4 mb-6">
                <h2 className="text-xl font-semibold text-pretty text-gray-500">Recent Activity</h2>
                <ActivityFeed />
              </div>

              {/* Custom Table Example */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-500">Ad Performance Table</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Ad Title</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Clicks</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ad 1</TableCell>
                      <TableCell>1,245</TableCell>
                      <TableCell>321</TableCell>
                      <TableCell>Boosted</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ad 2</TableCell>
                      <TableCell>894</TableCell>
                      <TableCell>223</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ad 3</TableCell>
                      <TableCell>473</TableCell>
                      <TableCell>89</TableCell>
                      <TableCell>Inactive</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <EnhancedAnalyticsMain />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <MessagesMain />
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved-searches">
          <CategoriesSavedSearchesMain />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsMain />
        </TabsContent>

        {/* Profile Settings Tab */}
        <TabsContent value="profile">
          <ProfileMain />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <BillingMain />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <SupportMain />
        </TabsContent>
      </Tabs>
    </div>
  );
}
