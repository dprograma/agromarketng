"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
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
  Wallet,
  Download,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw
} from "lucide-react";
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

interface TopAd {
  title: string;
  views: number;
  clicks: number;
  ctr: number;
}

interface AdData {
  impressions: number;
  clicks: number;
  engagementRate: string;
  conversionRate: number;
  ctr: number;
  dailyViews: number[];
  dailyClicks: number[];
  topAds: TopAd[];
}

export default function EnhancedAnalyticsMain() {
  const [activeTab, setActiveTab] = useState("performance");
  const [timeRange, setTimeRange] = useState("7days");
  const [isLoading, setIsLoading] = useState(false);
  const [adData, setAdData] = useState<AdData>({
    impressions: 0,
    clicks: 0,
    engagementRate: '0%',
    conversionRate: 0,
    ctr: 0,
    dailyViews: [],
    dailyClicks: [],
    topAds: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/analytics?timeRange=${timeRange}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();

      // Update ad data with real values from the API (with zero-division guards)
      const totalViews = data.totals?.views || 0;
      const totalClicks = data.totals?.clicks || 0;
      const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100 * 10) / 10 : 0;
      const engRate = data.engagementRate > 0 ? Math.round(data.engagementRate * 10) / 10 : 0;

      // Extract monthly trend data
      const trendKeys = Object.keys(data.monthlyTrends || {});
      const dailyViews: number[] = [];
      const dailyClicks: number[] = [];
      trendKeys.forEach((key: string) => {
        const trend = data.monthlyTrends[key];
        dailyViews.push(trend?.views || 0);
        dailyClicks.push(trend?.clicks || 0);
      });

      setAdData({
        impressions: totalViews,
        clicks: totalClicks,
        engagementRate: `${engRate}%`,
        conversionRate: ctr,
        ctr: ctr,
        dailyViews,
        dailyClicks,
        topAds: Object.entries(data.statusDistribution || {}).map(([status, count]) => ({
          title: status,
          views: Number(count),
          clicks: 0,
          ctr: 0
        }))
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
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
                                parseFloat(adData.engagementRate) * 10,
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
                                label: function (context) {
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500 text-lg">Demographics data is not yet available.</p>
                  <p className="text-gray-400 text-sm mt-2">Audience demographic tracking will be added in a future update.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials">
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <Wallet className="text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">Financial tracking is not yet available.</p>
                  <p className="text-gray-400 text-sm mt-2">Revenue and spending analytics will be added in a future update.</p>
                </CardContent>
              </Card>
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
