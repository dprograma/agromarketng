import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentsList from "./AgentsList";
import CreateAgent from "./CreateAgent";

export default function AgentTabs() {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList>
        <TabsTrigger value="list">Agents List</TabsTrigger>
        <TabsTrigger value="create">Create Agent</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <AgentsList />
      </TabsContent>
      
      <TabsContent value="create">
        <CreateAgent />
      </TabsContent>
    </Tabs>
  );
}