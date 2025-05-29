"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Agent {
  id: string;
  user: {
    name: string;
    email: string;
  };
  isAvailable: boolean;
  activeChats: number;
  specialties: string[];
  lastActive: string;
}

export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/admin/agents", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAgent = async (agentId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Chats</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.user.name}</TableCell>
              <TableCell>{agent.user.email}</TableCell>
              <TableCell>
                <Badge variant={agent.isAvailable ? "success" : "secondary"}>
                  {agent.isAvailable ? "Online" : "Offline"}
                </Badge>
              </TableCell>
              <TableCell>{agent.activeChats}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {agent.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {new Date(agent.lastActive).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant={agent.isAvailable ? "destructive" : "default"}
                  onClick={() => handleToggleAgent(agent.id, !agent.isAvailable)}
                >
                  {agent.isAvailable ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}