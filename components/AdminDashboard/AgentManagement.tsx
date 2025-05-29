"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionWrapper";
import { BarChart, UserPlus, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentsList from "./AgentsList";
import CreateAgent from "./CreateAgent";
import toast from "react-hot-toast";

interface Agent {
  id: string;
  user: {
    name: string;
    email: string;
  };
  isOnline: boolean;
  activeChats: number;
  lastActive: string;
  specialties: string[];
}

export default function AgentManagement() {
  const { session } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.role === 'admin') {
      fetchAgents();
    }
  }, [session]);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/admin/agents", {
        credentials: 'include' 
      });
      
      console.log("agent response: ", response);
      if (response.ok) {
        const data = await response.json();
        console.log("decoded agent response: ", data);
        setAgents(data);
      } else {
        // Only show error for non-401 responses
        if (response.status !== 401) {
          toast.error("Failed to fetch agents");
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgentEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          email: newAgentEmail,
          specialties: specialties.split(",").map(s => s.trim()),
        }),
      });

      if (response.ok) {
        toast.success("Agent created successfully");
        fetchAgents();
        setNewAgentEmail("");
        setSpecialties("");
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAgent = async (agentId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ isAvailable: active }),
      });

      if (response.ok) {
        toast.success(`Agent ${active ? "activated" : "deactivated"} successfully`);
        fetchAgents();
      }
    } catch (error) {
      toast.error("Failed to update agent status");
    }
  };

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
        <p className="text-gray-500 mt-1">
          Manage your support team and track their performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-12 h-12 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-semibold">{agents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserPlus className="w-12 h-12 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Now</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart className="w-12 h-12 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg. Response Time</p>
              <p className="text-2xl font-semibold">2.5m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs defaultValue="list" className="w-full">
          <div className="px-4 py-3 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="text-sm">
                <Users className="w-4 h-4 mr-2" />
                Agents List
              </TabsTrigger>
              <TabsTrigger value="create" className="text-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Agent
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="list">
              <AgentsList />
            </TabsContent>
            <TabsContent value="create">
              <CreateAgent />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}