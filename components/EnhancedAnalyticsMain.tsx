"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import { 
  Banknote, 
  Coins, 
  Wallet, 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adPerformance, demographics, financialData } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

// Register necessary Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function EnhancedAnalyticsMain() {
  const [activeTab, setActiveTab] = useState("performance");
  const [timeRange, setTimeRange] = useState("7days");
  const [isLoading, setIsLoading] = useState(false);
  const [adData, setAdData] = useState({
    impressions: adPerformance.impressions,
    clicks: adPerformance.clicks,
    engagementRate: adPerformance.engagementRate,
    conversionRate: 3.2,
    ctr: 2.8,
    dailyViews: [120, 145, 132, 165, 178, 156, 198],
    dailyClicks: [28, 32, 25, 40, 45, 38, 52],
    topAds: [
      { title: "Organic Tomatoes", views: 1245, clicks: 321, ctr: 25.8 },
      { title: "Premium Olive Oil", views: 894, clicks: 223, ctr: 24.9 },
      { title: "Natural Honey", views: 756, clicks: 185, ctr: 24.5 },
    ]
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate the data
      setTimeout(() => {
        // Generate random data based on time range
        const multiplier = timeRange === "30days" ? 4 : timeRange === "90days" ? 12 : 1;
        
        setAdData({
          impressions: Math.round(adPerformance.impressions * (0.8 + Math.random() * 0.4) * multiplier),
          clicks: Math.round(adPerformance.clicks * (0.8 + Math.random() * 0.4) * multiplier),
          engagementRate: Math.round(adPerformance.engagementRate * (0.9 + Math.random() * 0.2) * 10) / 10,
          conversionRate: Math.round((2.5 + Math.random() * 1.5) * 10) / 10,
          ctr: Math.round((2.2 + Math.random() * 1.2) * 10) / 10,
          dailyViews: Array(7).fill(0).map(() => Math.round(100 + Math.random() * 100)),
          dailyClicks: Array(7).fill(0).map(() => Math.round(20 + Math.random() * 40)),
          topAds: [
            { 
              title: "Organic Tomatoes", 
              views: Math.round(1000 + Math.random() * 500), 
              clicks: Math.round(250 + Math.random() * 150), 
              ctr: Math.round((20 + Math.random() * 10) * 10) / 10 
            },
            { 
              title: "Premium Olive Oil", 
              views: Math.round(800 + Math.random() * 400), 
              clicks: Math.round(200 + Math.random() * 100), 
              ctr: Math.round((20 + Math.random() * 10) * 10) / 10 
            },
            { 
              title: "Natural Honey", 
              views: Math.round(600 + Math.random() * 300), 
              clicks: Math.round(150 + Math.random() * 80), 
              ctr: Math.round((20 + Math.random() * 10) * 10) / 10 
            },
          ]
        });
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast.success("Analytics data exported successfully!");
  };

  const getDayLabels = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your ad performance and audience insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2" onClick={fetchAnalyticsData}>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{adData.impressions.toLocaleString()}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> +12.5%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{adData.clicks.toLocaleString()}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> +8.3%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Click-Through Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{adData.ctr}%</div>
                  <div className="text-sm text-red-600 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-1" /> -2.1%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{adData.conversionRate}%</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> +5.7%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="ads">Top Ads</TabsTrigger>
            </TabsList>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: getDayLabels(),
                          datasets: [
                            {
                              label: "Views",
                              data: adData.dailyViews,
                              borderColor: "rgba(34, 197, 94, 1)",
                              backgroundColor: "rgba(34, 197, 94, 0.1)",
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: getDayLabels(),
                          datasets: [
                            {
                              label: "Clicks",
                              data: adData.dailyClicks,
                              borderColor: "rgba(79, 70, 229, 1)",
                              backgroundColor: "rgba(79, 70, 229, 0.1)",
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: ["Impressions", "Clicks", "Engagement Rate", "Conversion Rate"],
                          datasets: [
                            {
                              label: "Performance Metrics",
                              data: [
                                adData.impressions / 100, 
                                adData.clicks, 
                                adData.engagementRate * 10, 
                                adData.conversionRate * 10
                              ],
                              backgroundColor: [
                                "rgba(79, 70, 229, 0.6)",
                                "rgba(34, 197, 94, 0.6)",
                                "rgba(245, 158, 11, 0.6)",
                                "rgba(239, 68, 68, 0.6)",
                              ],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.dataset.label || '';
                                  const value = context.parsed.y;
                                  const index = context.dataIndex;
                                  
                                  if (index === 0) return `${label}: ${value * 100}`;
                                  if (index === 1) return `${label}: ${value}`;
                                  if (index === 2 || index === 3) return `${label}: ${value / 10}%`;
                                  
                                  return `${label}: ${value}`;
                                }
                              }
                            }
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Age Group Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Pie
                        data={{
                          labels: demographics.ageGroups.map((age) => age.group),
                          datasets: [
                            {
                              data: demographics.ageGroups.map((age) => age.percentage),
                              backgroundColor: [
                                "rgba(79, 70, 229, 0.6)",
                                "rgba(34, 197, 94, 0.6)",
                                "rgba(245, 158, 11, 0.6)",
                                "rgba(239, 68, 68, 0.6)",
                              ],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: demographics.topLocations.map((loc) => loc.country),
                          datasets: [
                            {
                              label: "Percentage of Users",
                              data: demographics.topLocations.map((loc) => loc.percentage),
                              backgroundColor: "rgba(34, 197, 94, 0.6)",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y',
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Doughnut
                        data={{
                          labels: ["Total Spent", "Total Earnings", "Profit"],
                          datasets: [
                            {
                              data: [
                                financialData.totalSpent, 
                                financialData.earnings, 
                                financialData.profit
                              ],
                              backgroundColor: [
                                "rgba(239, 68, 68, 0.6)",
                                "rgba(34, 197, 94, 0.6)",
                                "rgba(79, 70, 229, 0.6)",
                              ],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg flex items-center space-x-3">
                        <Coins className="text-red-500" size={24} />
                        <div>
                          <p className="text-gray-600 text-sm">Total Spent on Ads</p>
                          <p className="text-lg font-semibold">₦{financialData.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg flex items-center space-x-3">
                        <Banknote className="text-green-500" size={24} />
                        <div>
                          <p className="text-gray-600 text-sm">Total Earnings</p>
                          <p className="text-lg font-semibold">₦{financialData.earnings.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg flex items-center space-x-3">
                        <Wallet className="text-blue-500" size={24} />
                        <div>
                          <p className="text-gray-600 text-sm">Profit</p>
                          <p className="text-lg font-semibold">₦{financialData.profit.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Top Ads Tab */}
            <TabsContent value="ads">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Ad Title</th>
                          <th className="text-right py-3 px-4">Views</th>
                          <th className="text-right py-3 px-4">Clicks</th>
                          <th className="text-right py-3 px-4">CTR</th>
                          <th className="text-right py-3 px-4">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adData.topAds.map((ad, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4 font-medium">{ad.title}</td>
                            <td className="text-right py-3 px-4">{ad.views.toLocaleString()}</td>
                            <td className="text-right py-3 px-4">{ad.clicks.toLocaleString()}</td>
                            <td className="text-right py-3 px-4">{ad.ctr}%</td>
                            <td className="text-right py-3 px-4">
                              <div className="flex items-center justify-end">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, ad.ctr * 4)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
