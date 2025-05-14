"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Loader2, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AgentAnalyticsData {
  performanceMetrics: {
    totalChats: number;
    resolvedChats: number;
    resolutionRate: number;
    avgResponseTime: number;
  };
  chatVolumeData: {
    labels: string[];
    data: number[];
  };
  responseTimeData: {
    labels: string[];
    data: number[];
  };
}

export default function AgentAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AgentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent/analytics?timeRange=${timeRange}`, {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Analytics</h2>
        <select 
          className="px-4 py-2 border rounded-md text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : !analyticsData ? (
        <div className="text-center py-12 text-gray-500">
          <p>No analytics data available</p>
        </div>
      ) : (
        <>
          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-blue-500 mr-2" />
                  <span className="text-2xl font-semibold">{analyticsData.performanceMetrics.totalChats}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Resolved Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                  <span className="text-2xl font-semibold">{analyticsData.performanceMetrics.resolvedChats}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-2">
                    %
                  </div>
                  <span className="text-2xl font-semibold">{analyticsData.performanceMetrics.resolutionRate}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-500 mr-2" />
                  <span className="text-2xl font-semibold">{analyticsData.performanceMetrics.avgResponseTime} min</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chat-volume">Chat Volume</TabsTrigger>
              <TabsTrigger value="response-time">Response Time</TabsTrigger>
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
                          labels: analyticsData.chatVolumeData.labels,
                          datasets: [
                            {
                              label: "Number of Chats",
                              data: analyticsData.chatVolumeData.data,
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
                    <CardTitle>Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: analyticsData.responseTimeData.labels,
                          datasets: [
                            {
                              label: "Avg. Response Time (min)",
                              data: analyticsData.responseTimeData.data,
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
                            title: {
                              display: false,
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
            </TabsContent>

            <TabsContent value="chat-volume">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Volume Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <Bar
                      data={{
                        labels: analyticsData.chatVolumeData.labels,
                        datasets: [
                          {
                            label: "Number of Chats",
                            data: analyticsData.chatVolumeData.data,
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
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response-time">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <Line
                      data={{
                        labels: analyticsData.responseTimeData.labels,
                        datasets: [
                          {
                            label: "Avg. Response Time (min)",
                            data: analyticsData.responseTimeData.data,
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
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
