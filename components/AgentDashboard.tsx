"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/SessionWrapper";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

// Define types for the new messaging system (simplified for agent view)
interface AgentMessage {
  id: string;
  content: string;
  senderId: string; // Use senderId to match the new schema
  createdAt: string;
}

import { AgentConversation } from "@/types/agent"; // Import the interface

interface AgentMessage {
  id: string;
  content: string;
  senderId: string; // Use senderId to match the new schema
  createdAt: string;
}


export default function AgentDashboard() {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  // Agent dashboard doesn't need online status for non-websocket chat
  // const [isOnline, setIsOnline] = useState(false);
  const [activeConversations, setActiveConversations] = useState<AgentConversation[]>([]);
  // Agent dashboard doesn't have pending chats in the new system, they are all conversations
  // const [pendingChats, setPendingChats] = useState<AgentConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AgentConversation | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on component mount
  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages]);

  // Agent dashboard doesn't need socket connection logic
  // useEffect(() => { ... }, [session]);

  // Agent dashboard doesn't need to update agent status based on socket connection
  // const updateAgentStatus = async (isAvailable: boolean) => { ... };

  // Function to fetch conversations (agents can see all conversations)
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations', { // Agents can fetch all conversations
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }

      const data = await response.json();
      // Agent dashboard will display all conversations, no distinction between active/pending here
      setActiveConversations(data.conversations || []);
      // setPendingChats([]); // No pending chats in this model
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true); // Use general loading for messages too
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      // Update the selected conversation with fetched messages
      setSelectedConversation(prev => {
        if (!prev || prev.id !== conversationId) return prev;
        return {
          ...prev,
          messages: data.messages || []
        };
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };


  // Function to send a message
  const sendMessage = async () => {
    if (!selectedConversation || !message.trim()) return;

    // Agent sends message to the conversation
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: message })
      });

      if (response.ok) {
        const newMessage = await response.json();

        // Update selected conversation with the new message
        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage.message] // API returns { message: newMessage }
          };
        });

        // Update the conversation in the active list
        setActiveConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? {
                ...conv,
                lastMessage: newMessage.message, // Update last message
                updatedAt: newMessage.message.createdAt // Update updatedAt
              }
              : conv
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) // Re-sort
        );


        // Clear message input
        setMessage('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle Enter key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show error if no session
  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Unauthorized access</p>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Agent Dashboard</h2>
          {/* Agent online status is not needed for non-websocket chat */}
          {/* <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge> */}
        </div>

        <Tabs defaultValue="active"> {/* Keep tabs for now, but only one will be used */}
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversations ({activeConversations.length}) {/* Display all conversations here */}
            </TabsTrigger>
            {/* Remove pending chats tab */}
            {/* <TabsTrigger value="pending" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingChats.length})
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-2">
              {activeConversations.map(conversation => ( // Map over all conversations
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedConversation(conversation)} // Select the conversation
                >
                  <div className="flex justify-between items-center">
                    {/* Display buyer and seller names */}
                    <span className="font-medium">{conversation.buyer.name} - {conversation.seller.name}</span>
                    {/* Category and priority might not be directly on conversation in new schema, remove for now */}
                    {/* <Badge variant="outline">{conversation.category}</Badge> */}
                    {/* <Badge variant="outline">
                      Priority: {conversation.priority}
                    </Badge> */}
                  </div>
                  {/* Display last message content if available */}
                  {conversation.messages.length > 0 && (
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.messages[conversation.messages.length - 1]?.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Remove pending chats tab content */}
          {/* <TabsContent value="pending">
            <div className="space-y-2">
              {pendingChats.map(chat => (
                <div key={chat.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{chat.user.name}</span>
                    <Badge variant="outline">{chat.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 truncate">
                    {chat.messages[0]?.content}
                  </p>
                  <Button
                    onClick={() => acceptChat(chat.id)}
                    className="w-full"
                  >
                    Accept Chat
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent> */}
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? ( // Use selectedConversation
          <>
            <div className="p-4 bg-white border-b">
              <div className="flex justify-between items-center">
                <div>
                  {/* Display buyer and seller info */}
                  <h3 className="font-medium">Conversation between {selectedConversation.buyer.name} and {selectedConversation.seller.name}</h3>
                  {/* Display ad title */}
                  <p className="text-sm text-gray-500">Regarding Ad: {selectedConversation.ad.title}</p>
                </div>
                {/* Remove category and priority badges */}
                {/* <div className="flex gap-2">
                  <Badge variant="outline">{selectedChat.category}</Badge>
                  <Badge variant="outline">
                    Priority: {selectedChat.priority}
                  </Badge>
                </div> */}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedConversation.messages.map((msg, idx) => ( // Map over selectedConversation messages
                <div
                  key={msg.id} // Use message id as key
                  className={`flex mb-4 ${msg.senderId === session?.id ? 'justify-end' : 'justify-start' // Use senderId
                    }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === session?.id // Use senderId
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100'
                      }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Type your response..."
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start responding</p>
          </div>
        )}
      </div>
    </div>
  );
}