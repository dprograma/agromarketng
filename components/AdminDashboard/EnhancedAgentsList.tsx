"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Search, Filter, ArrowUpDown, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import AgentPerformanceCard from "./AgentPerformanceCard";

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
  performance?: {
    responseTime: number;
    resolutionRate: number;
    satisfaction: number;
  };
}

export default function EnhancedAgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);

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
        // Add mock performance data
        const enhancedData = data.map((agent: Agent) => ({
          ...agent,
          performance: {
            responseTime: Math.random() * 4 + 1, // 1-5 minutes
            resolutionRate: Math.floor(Math.random() * 20) + 80, // 80-100%
            satisfaction: Math.random() * 1.5 + 3.5, // 3.5-5.0 stars
          },
        }));
        setAgents(enhancedData);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAgent = async (agentId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable }),
      });

      if (response.ok) {
        // Show success toast with animation
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Agent {isAvailable ? "activated" : "deactivated"} successfully</span>
          </div>
        );
        
        // Update local state
        setAgents(
          agents.map((agent) =>
            agent.id === agentId ? { ...agent, isAvailable } : agent
          )
        );
      } else {
        throw new Error("Failed to update agent status");
      }
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Failed to update agent status");
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId);
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = 
      filterAvailable === null || agent.isAvailable === filterAvailable;
    
    return matchesSearch && matchesAvailability;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    switch (sortField) {
      case "name":
        valueA = a.user.name;
        valueB = b.user.name;
        break;
      case "email":
        valueA = a.user.email;
        valueB = b.user.email;
        break;
      case "status":
        valueA = a.isAvailable ? 1 : 0;
        valueB = b.isAvailable ? 1 : 0;
        break;
      case "activeChats":
        valueA = a.activeChats;
        valueB = b.activeChats;
        break;
      case "responseTime":
        valueA = a.performance?.responseTime || 0;
        valueB = b.performance?.responseTime || 0;
        break;
      case "resolutionRate":
        valueA = a.performance?.resolutionRate || 0;
        valueB = b.performance?.resolutionRate || 0;
        break;
      case "satisfaction":
        valueA = a.performance?.satisfaction || 0;
        valueB = b.performance?.satisfaction || 0;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search agents by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterAvailable === true ? "default" : "outline"}
            onClick={() => setFilterAvailable(filterAvailable === true ? null : true)}
            className="text-sm"
          >
            Online Only
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="text-sm"
          >
            {viewMode === "table" ? "Card View" : "Table View"}
          </Button>
        </div>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No agents found matching your criteria.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-green-600"
                  >
                    Name
                    {sortField === "name" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 hover:text-green-600"
                  >
                    Email
                    {sortField === "email" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-center">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 hover:text-green-600 mx-auto"
                  >
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-center">
                  <button
                    onClick={() => handleSort("activeChats")}
                    className="flex items-center gap-1 hover:text-green-600 mx-auto"
                  >
                    Active Chats
                    {sortField === "activeChats" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Specialties</TableHead>
                <TableHead className="font-semibold text-center">
                  <button
                    onClick={() => handleSort("satisfaction")}
                    className="flex items-center gap-1 hover:text-green-600 mx-auto"
                  >
                    Rating
                    {sortField === "satisfaction" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAgents.map((agent) => (
                <React.Fragment key={agent.id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell className="font-medium">{agent.user.name}</TableCell>
                    <TableCell>{agent.user.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={agent.isAvailable ? "success" : "secondary"}
                        className="animate-fade-in"
                      >
                        {agent.isAvailable ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.activeChats}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {agent.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-1">{agent.performance?.satisfaction.toFixed(1)}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(agent.id)}
                        className="text-xs py-1 px-2"
                      >
                        Details
                      </Button>
                      <Button
                        variant={agent.isAvailable ? "destructive" : "default"}
                        onClick={() => handleToggleAgent(agent.id, !agent.isAvailable)}
                        className="text-xs py-1 px-2"
                      >
                        {agent.isAvailable ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {agent.isAvailable ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <AnimatePresence>
                    {selectedAgent === agent.id && (
                      <TableRow>
                        <TableCell className="p-0 border-b" data-colSpan={7}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-gray-50"
                          >
                            <div className="p-4">
                              <AgentPerformanceCard
                                agentId={agent.id}
                                onViewDetails={() => {}}
                              />
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAgents.map((agent) => (
            <AgentPerformanceCard
              key={agent.id}
              agentId={agent.id}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
