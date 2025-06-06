export interface AgentConversation {
  id: string;
  updatedAt: Date;
  buyer: { name: string };
  seller: { name: string };
  messages: any[]; // Further refinement of message type might be needed based on other code
  ad: { title: string };
  // Add other properties as needed based on the full AgentConversation structure
}