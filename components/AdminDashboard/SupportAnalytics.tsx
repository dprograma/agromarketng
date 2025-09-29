"use client";

import { useState, useEffect } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Loader2, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  chatVolume: {
    labels: string[];
    data: number[];
  };
  responseTime: {
    labels: string[];
    data: number[];
  };
  resolutionRate: {
    labels: string[];
    data: number[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
  };
  agentPerformance: {
    agents: string[];
    responseTime: number[];
    resolutionRate: number[];
    satisfaction: number[];
  };
}

export default function SupportAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7days");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();

        // Transform the API response to match our component's data structure
        const transformedData: AnalyticsData = {
          chatVolume: data.chatVolume || { labels: [], data: [] },
          responseTime: data.responseTime || { labels: [], data: [] },
          resolutionRate: data.resolutionRate || { labels: [], data: [] },
          categoryDistribution: data.categoryDistribution || { labels: [], data: [] },
          agentPerformance: data.agentPerformance || { agents: [], responseTime: [], resolutionRate: [], satisfaction: [] }
        };

        setAnalyticsData(transformedData);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch analytics data' }));
        throw new Error(errorData.message || "Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load analytics data";
      setError(errorMessage);
      toast.error(errorMessage);

      // Set default empty data to prevent render issues
      setAnalyticsData({
        chatVolume: { labels: [], data: [] },
        responseTime: { labels: [], data: [] },
        resolutionRate: { labels: [], data: [] },
        categoryDistribution: { labels: [], data: [] },
        agentPerformance: { agents: [], responseTime: [], resolutionRate: [], satisfaction: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  // Always render the analytics content, even if there's an error or no data
  // The charts will show empty state or default values

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Support Analytics</h2>
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
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Custom Range</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
              className="ml-auto text-red-600 border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: analyticsData?.chatVolume.labels || [],
                      datasets: [
                        {
                          label: "Number of Chats",
                          data: analyticsData?.chatVolume.data || [],
                          backgroundColor: "rgba(34, 197, 94, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time (minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line
                    data={{
                      labels: analyticsData?.responseTime.labels || [],
                      datasets: [
                        {
                          label: "Response Time",
                          data: analyticsData?.responseTime.data || [],
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
                          position: "top" as const,
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

            {/* Resolution Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line
                    data={{
                      labels: analyticsData?.resolutionRate.labels || [],
                      datasets: [
                        {
                          label: "Resolution Rate",
                          data: analyticsData?.resolutionRate.data || [],
                          borderColor: "rgba(245, 158, 11, 1)",
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          min: 50,
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut
                    data={{
                      labels: analyticsData?.categoryDistribution.labels || [],
                      datasets: [
                        {
                          label: "Categories",
                          data: analyticsData?.categoryDistribution.data || [],
                          backgroundColor: [
                            "rgba(34, 197, 94, 0.6)",
                            "rgba(79, 70, 229, 0.6)",
                            "rgba(245, 158, 11, 0.6)",
                            "rgba(239, 68, 68, 0.6)",
                            "rgba(107, 114, 128, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right" as const,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar
                  data={{
                    labels: analyticsData?.agentPerformance.agents || [],
                    datasets: [
                      {
                        label: "Avg. Response Time (min)",
                        data: analyticsData?.agentPerformance.responseTime || [],
                        backgroundColor: "rgba(79, 70, 229, 0.6)",
                      },
                      {
                        label: "Resolution Rate (%)",
                        data: analyticsData?.agentPerformance.resolutionRate || [],
                        backgroundColor: "rgba(34, 197, 94, 0.6)",
                      },
                      {
                        label: "Satisfaction (out of 5)",
                        data: (analyticsData?.agentPerformance.satisfaction || []).map(
                          (score) => score * 20
                        ), // Scale to percentage
                        backgroundColor: "rgba(245, 158, 11, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.dataset.label || "";
                            const value = context.parsed.y;
                            if (label.includes("Satisfaction")) {
                              return `${label}: ${value / 20}/5`;
                            }
                            return `${label}: ${value}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Support Categories Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Doughnut
                  data={{
                    labels: analyticsData?.categoryDistribution.labels || [],
                    datasets: [
                      {
                        label: "Categories",
                        data: analyticsData?.categoryDistribution.data || [],
                        backgroundColor: [
                          "rgba(34, 197, 94, 0.6)",
                          "rgba(79, 70, 229, 0.6)",
                          "rgba(245, 158, 11, 0.6)",
                          "rgba(239, 68, 68, 0.6)",
                          "rgba(107, 114, 128, 0.6)",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right" as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar
                  data={{
                    labels: analyticsData?.agentPerformance.agents || [],
                    datasets: [
                      {
                        label: "Satisfaction Score (out of 5)",
                        data: analyticsData?.agentPerformance.satisfaction || [],
                        backgroundColor: "rgba(34, 197, 94, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 5,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
