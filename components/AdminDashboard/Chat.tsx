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
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Support Chats</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage customer support conversations</p>
        </div>
        <Button onClick={fetchChats} variant="outline" className="text-sm py-2 px-4 w-full sm:w-auto">
          <span className="mr-2">🔄</span>
          Refresh
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All Chats
              {chats.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                  {chats.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="closed" className="text-xs sm:text-sm">
              Closed
            </TabsTrigger>
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
            <div className="space-y-3">
              {chats.map((chat) => (
                <div key={chat.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{chat.user.name}</h3>
                        <span className="text-xs text-gray-400">#{chat.id.slice(-6)}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.user.email}</p>
                      {(chat as any).subject && (
                        <p className="text-sm font-medium text-gray-700 mt-1 truncate">{(chat as any).subject}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end">
                      <div className="flex gap-2">
                        {getStatusBadge(chat.status)}
                        {getPriorityBadge(chat.priority)}
                      </div>
                      {chat.category && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                          {chat.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <span className="text-xs text-gray-500 block mb-1">Latest message:</span>
                    {chat.messages[0]?.content ? (
                      <p className="line-clamp-2">{chat.messages[0].content}</p>
                    ) : (
                      <p className="italic text-gray-400">No messages yet</p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div>
                        {chat.agent ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Assigned to: <span className="font-medium">{chat.agent.user.name}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            Unassigned
                          </span>
                        )}
                      </div>
                      {chat.messages.length > 0 && (
                        <span>{chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div>Updated: {new Date(chat.updatedAt).toLocaleDateString()}</div>
                      <div className="text-gray-400">{new Date(chat.updatedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}