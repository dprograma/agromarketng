"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  senderType: string;
  createdAt: string;
}

interface SupportChat {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  agentId: string | null;
  agent: {
    user: {
      name: string;
      email: string;
    };
  } | null;
  status: string;
  category: string;
  priority: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function Chat() {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchChats();
  }, [activeTab]);

  const fetchChats = async () => {
    try {
      const status = activeTab !== "all" ? activeTab : "";
      const response = await fetch(`/api/admin/chats${status ? `?status=${status}` : ""}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else {
        throw new Error("Failed to fetch chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="outline">Low</Badge>;
      case 2:
        return <Badge variant="secondary">Medium</Badge>;
      case 3:
        return <Badge variant="destructive">High</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Support Chats</h2>
        <Button onClick={fetchChats} variant="outline" className="text-sm py-1 px-3">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Chats</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No chats found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div key={chat.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{chat.user.name}</h3>
                      <p className="text-sm text-gray-500">{chat.user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(chat.status)}
                      {getPriorityBadge(chat.priority)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {chat.messages[0]?.content || "No messages yet"}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {chat.agent ? (
                        <span>Assigned to: {chat.agent.user.name}</span>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}