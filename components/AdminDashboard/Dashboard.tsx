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
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="manage-agent">Manage Agent</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-12 h-12 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Agents</p>
                    <p className="text-2xl font-semibold">{stats?.totalAgents || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <MessageSquare className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Active Chats</p>
                    <p className="text-2xl font-semibold">{stats?.activeChats || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Clock className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Avg. Response</p>
                    <p className="text-2xl font-semibold">{stats?.avgResponseTime || 0}m</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <BarChart3 className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Resolution Rate</p>
                    <p className="text-2xl font-semibold">{stats?.resolutionRate || 0}%</p>
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