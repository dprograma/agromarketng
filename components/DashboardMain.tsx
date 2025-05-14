"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2,
  Eye,
  MousePointer,
  Share2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "@/components/Spinner";
import AnalyticsMain from "@/components/AnalyticsMain";
import MessagesMain from "@/components/MessagesMain";
import CategoriesSavedSearchesMain from "@/components/CategoriesSavedSearchesMain";
import NotificationsMain from "@/components/NotificationsMain";
import ProfileMain from "@/components/ProfileMain";
import BillingMain from "@/components/BillingMain";
import SupportMain from "@/components/SupportMain";

interface DashboardMainProps {
  defaultTab?: string;
}

export default function DashboardMain({ defaultTab = "dashboard" }: DashboardMainProps) {
  // State for mobile view and active tab
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    adPerformance: {
      activeAds: 0,
      totalViews: 0,
      totalClicks: 0,
      totalShares: 0,
      boostedAds: 0,
      engagementRate: '0%'
    },
    promotionSummary: {
      ongoingPromotions: 0,
      earningsFromPromotions: 0
    },
    recentActivity: [],
    adPerformanceTable: [],
    chartData: {
      dailyLabels: [],
      dailyViews: [],
      dailyClicks: []
    },
    categoryDistribution: [],
    subscription: null,
    timeRange: '30days'
  });

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab === "dashboard") {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch(`/api/user/dashboard?timeRange=${timeRange}`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setDashboardData(data);
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch dashboard data:", errorData);
            setError(errorData.error || "Failed to fetch dashboard data");
            toast.error("Failed to load dashboard data. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setError("An unexpected error occurred. Please try again.");
          toast.error("Failed to load dashboard data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [activeTab, timeRange]);


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
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Time Range Filter */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Dashboard Overview</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Time Range:</span>
                  <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Active Ads */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Active Ads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-gray-800">{dashboardData.adPerformance.activeAds}</span>
                      <span className="text-sm text-gray-500 mt-1">Total active listings</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Views */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-500" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-gray-800">{dashboardData.adPerformance.totalViews.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 mt-1">Ad impressions</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Clicks */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <MousePointer className="w-5 h-5 mr-2 text-purple-500" />
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-gray-800">{dashboardData.adPerformance.totalClicks.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 mt-1">User interactions</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                      Engagement Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-gray-800">{dashboardData.adPerformance.engagementRate}</span>
                      <span className="text-sm text-gray-500 mt-1">Click-through rate</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Shares & Boosted Ads */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Additional Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Share2 className="w-4 h-4 mr-2 text-green-600" />
                          <span>Total Shares:</span>
                        </div>
                        <span className="font-medium">{dashboardData.adPerformance.totalShares.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Rocket className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Boosted Ads:</span>
                        </div>
                        <span className="font-medium">{dashboardData.adPerformance.boostedAds}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Promotion Summary */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Promotion Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                          <span>Ongoing Promotions:</span>
                        </div>
                        <span className="font-medium">{dashboardData.promotionSummary.ongoingPromotions}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                          <span>Earnings:</span>
                        </div>
                        <span className="font-medium">₦{dashboardData.promotionSummary.earningsFromPromotions.toLocaleString()}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button onClick={() => router.push("/dashboard/new-ad")} variant="default" className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Post New Ad
                      </Button>
                      <Button onClick={() => router.push("/dashboard/promotions")} variant="outline" className="w-full flex items-center justify-center">
                        <Rocket className="mr-2 h-4 w-4" /> Boost Ads
                      </Button>
                      <Button onClick={() => setActiveTab("analytics")} variant="outline" className="w-full flex items-center justify-center">
                        <BarChart className="mr-2 h-4 w-4" /> View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Feed */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-700">Recent Activity</h2>
                  {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/notifications")}>
                      View All
                    </Button>
                  )}
                </div>

                {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentActivity.map((activity: any, index: number) => (
                      <div key={activity.id || index} className="flex items-start p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                        <div className="mr-3 mt-1">
                          {activity.type === 'view' && <Eye className="h-5 w-5 text-blue-500" />}
                          {activity.type === 'click' && <MousePointer className="h-5 w-5 text-purple-500" />}
                          {activity.type === 'share' && <Share2 className="h-5 w-5 text-green-500" />}
                          {activity.type === 'boost' && <Rocket className="h-5 w-5 text-orange-500" />}
                          {activity.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                          {!activity.type && <Clock className="h-5 w-5 text-gray-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{activity.description}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-500 text-sm">{activity.time}</span>
                            {activity.read === false && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-md border">
                    <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity to display</p>
                    <p className="text-gray-400 text-sm mt-1">Your activity will appear here</p>
                  </div>
                )}
              </div>

              {/* Ad Performance Table */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-700">Ad Performance</h2>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/my-ads")}>
                    View All Ads
                  </Button>
                </div>

                <div className="bg-white rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.adPerformanceTable && dashboardData.adPerformanceTable.length > 0 ? (
                        dashboardData.adPerformanceTable.map((ad: any, index: number) => (
                          <TableRow key={ad.id || index} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center">
                                {ad.image ? (
                                  <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="truncate max-w-[200px]">
                                  <div className="font-medium text-gray-900 truncate">{ad.title}</div>
                                  {ad.category && <div className="text-xs text-gray-500">{ad.category}</div>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{ad.views.toLocaleString()}</TableCell>
                            <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                            <TableCell>{ad.ctr}%</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  ad.status === "Active" || ad.status === "Boosted"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : ad.status === "Pending"
                                    ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }
                              >
                                {ad.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center">
                              <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                              <p>No ad performance data available</p>
                              <Button
                                variant="link"
                                onClick={() => router.push("/dashboard/new-ad")}
                                className="text-green-600 mt-2"
                              >
                                Post your first ad
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsMain />
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
