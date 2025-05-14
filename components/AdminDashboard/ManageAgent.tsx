"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import EnhancedAgentsList from "./EnhancedAgentsList";
import CreateAgent from "./CreateAgent";

export default function ManageAgent() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-gray-500 mt-1">Manage your support agents</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <EnhancedAgentsList />
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