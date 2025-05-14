"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, StarHalf, Clock, CheckCircle, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface AgentPerformance {
  id: string;
  name: string;
  avatar?: string;
  responseTime: number;
  resolutionRate: number;
  satisfaction: number;
  chatsHandled: number;
  status: "online" | "offline" | "busy";
  lastActive: string;
}

interface AgentPerformanceCardProps {
  agentId: string;
  onViewDetails?: (agentId: string) => void;
}

export default function AgentPerformanceCard({ agentId, onViewDetails }: AgentPerformanceCardProps) {
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentPerformance | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchAgentPerformance();
  }, [agentId]);

  const fetchAgentPerformance = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate the data
      setTimeout(() => {
        const mockAgent: AgentPerformance = {
          id: agentId,
          name: "John Doe",
          responseTime: 2.5,
          resolutionRate: 92,
          satisfaction: 4.7,
          chatsHandled: 156,
          status: "online",
          lastActive: new Date().toISOString(),
        };
        setAgent(mockAgent);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching agent performance:", error);
      toast.error("Failed to load agent performance data");
      setLoading(false);
    }
  };

  const handleMouseEnter = (content: string, e: React.MouseEvent) => {
    setTooltipContent(content);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half-star" className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-400";
      case "busy":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </CardContent>
      </Card>
    );
  }

  if (!agent) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex justify-center items-center h-48">
          <p className="text-gray-500">Agent data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {agent.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`}></div>
                </div>
                <div>
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <p className="text-xs text-gray-500">
                    Last active: {new Date(agent.lastActive).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant={agent.status === "online" ? "success" : agent.status === "busy" ? "secondary" : "outline"}>
                {agent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2"
                onMouseEnter={(e) => handleMouseEnter("Average response time to customer inquiries", e)}
                onMouseLeave={handleMouseLeave}
              >
                <Clock className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Response Time</span>
                    <span className="text-xs font-medium">{agent.responseTime} min</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (agent.responseTime * 20))} className="h-1.5" />
                </div>
              </div>

              <div 
                className="flex items-center gap-2"
                onMouseEnter={(e) => handleMouseEnter("Percentage of chats successfully resolved", e)}
                onMouseLeave={handleMouseLeave}
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Resolution Rate</span>
                    <span className="text-xs font-medium">{agent.resolutionRate}%</span>
                  </div>
                  <Progress value={agent.resolutionRate} className="h-1.5" />
                </div>
              </div>

              <div 
                className="flex items-center gap-2"
                onMouseEnter={(e) => handleMouseEnter("Customer satisfaction rating (out of 5)", e)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <span className="text-yellow-500 text-xs font-bold">★</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Satisfaction</span>
                    <span className="text-xs font-medium">{agent.satisfaction}/5</span>
                  </div>
                  <div className="flex">
                    {renderStars(agent.satisfaction)}
                  </div>
                </div>
              </div>

              <div 
                className="flex items-center gap-2"
                onMouseEnter={(e) => handleMouseEnter("Total number of chats handled", e)}
                onMouseLeave={handleMouseLeave}
              >
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Chats Handled</span>
                    <span className="text-xs font-medium">{agent.chatsHandled}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => onViewDetails && onViewDetails(agent.id)}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View Detailed Performance →
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-black text-white text-xs py-1 px-2 rounded z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              maxWidth: "200px",
            }}
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
