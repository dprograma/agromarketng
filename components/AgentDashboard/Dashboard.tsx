"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, TicketCheck, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import ChatManagement from "./ChatManagement";
import TicketManagement from "./TicketManagement";
import KnowledgeBase from "./KnowledgeBase";
import AgentAnalytics from "../AgentAnalytics";
import Settings from "./Settings";

interface AgentStats {
  activeChats: number;
  pendingChats: number;
  resolvedChats: number;
  activeTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
}

interface AgentDashboardProps {
  defaultTab?: string;
}

export default function AgentDashboard({ defaultTab = "overview" }: AgentDashboardProps) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || defaultTab;

  useEffect(() => {
    fetchAgentStats();
  }, []);

  const fetchAgentStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agent/stats", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch agent stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      toast.error("Failed to load agent statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your support activities</p>
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Active Chats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MessageSquare className="w-8 h-8 text-blue-500 mr-2" />
                      <span className="text-2xl font-semibold">{stats?.activeChats || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Pending Chats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-amber-500 mr-2" />
                      <span className="text-2xl font-semibold">{stats?.pendingChats || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Active Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <TicketCheck className="w-8 h-8 text-purple-500 mr-2" />
                      <span className="text-2xl font-semibold">{stats?.activeTickets || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Resolution Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                      <span className="text-2xl font-semibold">{stats?.resolutionRate || 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">New chat assigned</p>
                        <p className="text-sm text-gray-500">A new support chat has been assigned to you.</p>
                        <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Chat resolved</p>
                        <p className="text-sm text-gray-500">You successfully resolved a customer support chat.</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <TicketCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Ticket updated</p>
                        <p className="text-sm text-gray-500">You updated the status of a support ticket.</p>
                        <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                      onClick={() => document.querySelector('[data-value="chats"]')?.dispatchEvent(new MouseEvent('click'))}
                    >
                      <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-center font-medium">Manage Chats</p>
                    </button>
                    
                    <button 
                      className="p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors"
                      onClick={() => document.querySelector('[data-value="tickets"]')?.dispatchEvent(new MouseEvent('click'))}
                    >
                      <TicketCheck className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-center font-medium">Manage Tickets</p>
                    </button>
                    
                    <button 
                      className="p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors"
                      onClick={() => document.querySelector('[data-value="knowledge"]')?.dispatchEvent(new MouseEvent('click'))}
                    >
                      <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-center font-medium">Knowledge Base</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chats">
          <ChatManagement />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketManagement />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="analytics">
          <AgentAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
