"use client";

import React, { useState } from "react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
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
  Loader2,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Share2,
  BarChart3,
  Smartphone,
  Laptop,
  Users,
  Clock,
  RefreshCw,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

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

// Use the types from our hook

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("performance");
  const {
    data: analyticsData,
    isLoading,
    error,
    refreshData,
    setTimeRange
  } = useAnalytics();

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range as '7days' | '30days' | '90days');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📊 Analytics & Reports</h2>
      <p className="text-gray-600 text-center mt-2">Track ad performance, audience insights, and financials.</p>

      {/* Time Range Selector */}
      <div className="flex justify-center mt-4 gap-2">
        <select
          className="px-4 py-2 border rounded-md text-sm"
          onChange={(e) => handleTimeRangeChange(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days" selected>Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>

        <Button
          variant="outline"
          onClick={() => refreshData()}
          disabled={isLoading}
          className="flex items-center gap-1 h-8 px-3"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {["performance", "demographics", "financials"].map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-6 py-2 text-sm font-medium border-b-2 transition",
              activeTab === tab
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "performance" ? "📈 Ad Performance" : tab === "demographics" ? "🌍 Demographics" : "💰 Financials"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error.message || "Failed to load analytics data"}</p>
          <Button
            variant="outline"
            onClick={() => refreshData()}
            className="mt-4 h-8 px-3"
          >
            Try Again
          </Button>
        </div>
      ) : !analyticsData ? (
        <div className="text-center py-12 text-gray-500">
          <p>No analytics data available</p>
        </div>
      ) : (
        <>
          {/* Ad Performance */}
          {activeTab === "performance" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Ad Performance Dashboard</h3>

              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-blue-500" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold">{analyticsData.adPerformance.totalViews.toLocaleString()}</div>
                      {analyticsData.adPerformance.performanceTrends.views.change > 0 ? (
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" /> +{analyticsData.adPerformance.performanceTrends.views.change}%
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" /> {analyticsData.adPerformance.performanceTrends.views.change}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <MousePointer className="w-4 h-4 mr-2 text-purple-500" />
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold">{analyticsData.adPerformance.totalClicks.toLocaleString()}</div>
                      {analyticsData.adPerformance.performanceTrends.clicks.change > 0 ? (
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" /> +{analyticsData.adPerformance.performanceTrends.clicks.change}%
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" /> {analyticsData.adPerformance.performanceTrends.clicks.change}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <Share2 className="w-4 h-4 mr-2 text-green-500" />
                      Total Shares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold">{analyticsData.adPerformance.totalShares.toLocaleString()}</div>
                      {analyticsData.adPerformance.performanceTrends.shares.change > 0 ? (
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" /> +{analyticsData.adPerformance.performanceTrends.shares.change}%
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" /> {analyticsData.adPerformance.performanceTrends.shares.change}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-orange-500" />
                      Engagement Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.adPerformance.engagementRate}</div>
                    <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Performance Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Views</CardTitle>
                    <CardDescription>View trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: analyticsData.adPerformance.dailyData.labels,
                          datasets: [
                            {
                              label: "Views",
                              data: analyticsData.adPerformance.dailyData.viewsData,
                              borderColor: "rgba(59, 130, 246, 1)",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
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
                    <CardTitle>Daily Clicks & Shares</CardTitle>
                    <CardDescription>Interaction trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: analyticsData.adPerformance.dailyData.labels,
                          datasets: [
                            {
                              label: "Clicks",
                              data: analyticsData.adPerformance.dailyData.clicksData,
                              borderColor: "rgba(124, 58, 237, 1)",
                              backgroundColor: "rgba(124, 58, 237, 0.1)",
                              tension: 0.3,
                            },
                            {
                              label: "Shares",
                              data: analyticsData.adPerformance.dailyData.sharesData,
                              borderColor: "rgba(16, 185, 129, 1)",
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
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
              </div>

              {/* Category Performance */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Performance metrics by ad category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ads</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.adPerformance.categoryPerformance.map((category, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.views.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.clicks.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.engagementRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Details Table */}
              {analyticsData.adPerformance.adDetails.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Performance Details</CardTitle>
                    <CardDescription>Detailed metrics for each of your ads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analyticsData.adPerformance.adDetails.map((ad) => (
                            <tr key={ad.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="flex items-center">
                                  {ad.image && (
                                    <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{ad.title}</div>
                                    <div className="text-xs text-gray-500">{ad.category}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.views.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.clicks.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.shares.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.engagementRate}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge
                                  variant="outline"
                                  className={
                                    ad.status === "Active"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : ad.status === "Pending"
                                        ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                  }
                                >
                                  {ad.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Demographics */}
          {activeTab === "demographics" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">🌍 Audience Demographics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Total Audience Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Total Audience</CardTitle>
                    <CardDescription>Total views across all ads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-10 w-10 text-blue-500 mr-4" />
                      <div>
                        <div className="text-3xl font-bold">{analyticsData.demographics.totalAudience.toLocaleString()}</div>
                        <p className="text-sm text-gray-500">Total impressions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>Audience by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.demographics.devices.map((device, index) => (
                        <div key={index} className="flex items-center">
                          {device.device === "Mobile" && <Smartphone className="h-5 w-5 text-blue-500 mr-3" />}
                          {device.device === "Desktop" && <Laptop className="h-5 w-5 text-green-500 mr-3" />}
                          {device.device === "Tablet" && <Laptop className="h-5 w-5 text-purple-500 mr-3" />}
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{device.device}</span>
                              <span className="text-sm text-gray-500">{device.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${device.device === "Mobile"
                                  ? "bg-blue-500"
                                  : device.device === "Desktop"
                                    ? "bg-green-500"
                                    : "bg-purple-500"
                                  }`}
                                style={{ width: `${device.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Age Group Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Group Distribution</CardTitle>
                    <CardDescription>Audience by age group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: analyticsData.demographics.ageGroups.map((age) => age.group),
                          datasets: [
                            {
                              data: analyticsData.demographics.ageGroups.map((age) => age.percentage),
                              backgroundColor: [
                                "rgba(59, 130, 246, 0.7)", // Blue
                                "rgba(16, 185, 129, 0.7)", // Green
                                "rgba(245, 158, 11, 0.7)", // Yellow
                                "rgba(239, 68, 68, 0.7)",  // Red
                                "rgba(139, 92, 246, 0.7)"  // Purple
                              ],
                              borderColor: [
                                "rgba(59, 130, 246, 1)",
                                "rgba(16, 185, 129, 1)",
                                "rgba(245, 158, 11, 1)",
                                "rgba(239, 68, 68, 1)",
                                "rgba(139, 92, 246, 1)"
                              ],
                              borderWidth: 1
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                boxWidth: 15,
                                padding: 15
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                    <CardDescription>Audience by gender</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: analyticsData.demographics.gender.map((g) => g.gender),
                          datasets: [
                            {
                              data: analyticsData.demographics.gender.map((g) => g.percentage),
                              backgroundColor: [
                                "rgba(59, 130, 246, 0.7)", // Blue for Male
                                "rgba(236, 72, 153, 0.7)"  // Pink for Female
                              ],
                              borderColor: [
                                "rgba(59, 130, 246, 1)",
                                "rgba(236, 72, 153, 1)"
                              ],
                              borderWidth: 1
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Locations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Audience by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.demographics.topLocations.slice(0, 5).map((loc, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{loc.country}</span>
                            <span className="text-sm text-gray-500">{loc.percentage}% ({loc.views.toLocaleString()} views)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${loc.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time of Day */}
                <Card>
                  <CardHeader>
                    <CardTitle>Time of Day</CardTitle>
                    <CardDescription>When your audience is most active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.demographics.timeOfDay.map((time, index) => (
                        <div key={index}>
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">{time.time}</span>
                            <span className="text-sm text-gray-500 ml-auto">{time.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${index === 0 ? "bg-yellow-500" :
                                index === 1 ? "bg-green-500" :
                                  index === 2 ? "bg-blue-500" :
                                    "bg-purple-500"
                                }`}
                              style={{ width: `${time.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Financials */}
          {activeTab === "financials" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">💰 Revenue & Spending Breakdown</h3>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <Coins className="w-4 h-4 mr-2 text-red-500" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{analyticsData.financialData.totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Subscription & boost costs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-green-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{analyticsData.financialData.earnings.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Revenue from sales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <Wallet className="w-4 h-4 mr-2 text-blue-500" />
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{analyticsData.financialData.profit.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Earnings minus costs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                      ROI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.financialData.roi}%</div>
                    <p className="text-xs text-gray-500 mt-1">Return on investment</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue vs Spending Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Spending</CardTitle>
                    <CardDescription>Financial breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Doughnut
                        data={{
                          labels: ["Subscription Cost", "Boost Costs", "Earnings"],
                          datasets: [
                            {
                              data: [
                                analyticsData.financialData.subscriptionDetails.cost,
                                analyticsData.financialData.boostCosts,
                                analyticsData.financialData.earnings
                              ],
                              backgroundColor: [
                                "rgba(79, 70, 229, 0.7)", // Indigo
                                "rgba(225, 29, 72, 0.7)", // Red
                                "rgba(16, 185, 129, 0.7)" // Green
                              ],
                              borderColor: [
                                "rgba(79, 70, 229, 1)",
                                "rgba(225, 29, 72, 1)",
                                "rgba(16, 185, 129, 1)"
                              ],
                              borderWidth: 1
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                boxWidth: 15,
                                padding: 15
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Spending Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending Trends</CardTitle>
                    <CardDescription>Spending over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: analyticsData.financialData.monthlySpending.months,
                          datasets: [
                            {
                              label: "Monthly Spending",
                              data: analyticsData.financialData.monthlySpending.spending,
                              backgroundColor: "rgba(79, 70, 229, 0.7)",
                              borderColor: "rgba(79, 70, 229, 1)",
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top'
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return '₦' + value.toLocaleString();
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Details */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>Your current subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{analyticsData.financialData.subscriptionDetails.name}</h4>
                      <p className="text-sm text-gray-500">₦{analyticsData.financialData.subscriptionDetails.cost.toLocaleString()} per month</p>
                    </div>
                  </div>

                  {analyticsData.financialData.subscriptionDetails.features &&
                    analyticsData.financialData.subscriptionDetails.features.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Plan Features:</h5>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {Object.entries(analyticsData.financialData.subscriptionDetails.features).map(([key, value], index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>{key}: {String(value)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Boost Details */}
              {analyticsData.financialData.boostDetails.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Boost History</CardTitle>
                    <CardDescription>Details of your ad promotions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boost Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analyticsData.financialData.boostDetails.map((boost, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{boost.adTitle}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {boost.boostType === 1 ? "Standard" :
                                  boost.boostType === 2 ? "Premium" :
                                    boost.boostType === 3 ? "Featured" : "Basic"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(boost.boostStartDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(boost.boostEndDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₦{boost.cost.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
