"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, Clock, Settings, Loader2, LineChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageAgent from "./ManageAgent";
import Chat from "./Chat";
import SettingsTab from "./Settings";
import SupportAnalytics from "./SupportAnalytics";
import toast from "react-hot-toast";

interface AdminStats {
  totalAgents: number;
  activeAgents: number;
  activeChats: number;
  avgResponseTime: number;
  resolutionRate: number;
}

interface AdminDashboardProps {
  defaultTab?: string;
}

export default function AdminDashboard({ defaultTab = "dashboard" }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your support operations</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="manage-agent" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Agents</span>
            <span className="sm:hidden">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs sm:text-sm">
            <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">
            <LineChart className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-500">Loading admin statistics...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Agents</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats?.totalAgents || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Active Chats</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats?.activeChats || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Avg. Response</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats?.avgResponseTime || 0}m</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Resolution Rate</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats?.resolutionRate || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500 mt-1">Latest system events and updates</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">New agent registered</p>
                        <p className="text-xs text-gray-500 mt-1">Support Agent joined the team</p>
                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Support chat resolved</p>
                        <p className="text-xs text-gray-500 mt-1">Payment issue successfully resolved</p>
                        <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500 mt-1">Common administrative tasks</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button className="flex items-center p-3 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Manage Agents</span>
                    </button>
                    <button className="flex items-center p-3 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">View Chats</span>
                    </button>
                    <button className="flex items-center p-3 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage-agent">
          <ManageAgent />
        </TabsContent>

        <TabsContent value="chat">
          <Chat />
        </TabsContent>

        <TabsContent value="analytics">
          <SupportAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}