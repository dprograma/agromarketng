"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { useSession } from "@/components/SessionWrapper";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Define types for the new messaging system
interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
}

interface Conversation {
  id: string;
  ad: {
    id: string;
    title: string;
    images: string[];
  };
  buyer: {
    id: string;
    name: string;
    image: string | null;
  };
  seller: {
    id: string;
    name: string;
    image: string | null;
  };
  lastMessage: Message | null;
  updatedAt: string;
}


export default function Messages() {
  const searchParams = useSearchParams();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState("product-chats");

  // Product chats (user-to-user)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // State for product chat message sending loading
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to handle setting active tab based on search params and selecting conversations
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      // Check which tab is active to determine which conversation list to search
      if (activeTab === 'product-chats') { // Use activeTab state here
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    }
  }, [searchParams, conversations, activeTab]); // Added activeTab to dependencies

  // Effect to fetch all conversations when session is available
  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  // Effect to fetch messages for selected conversation and set up polling
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (selectedConversation) {
      // Initial fetch
      fetchMessages(selectedConversation.id);

      // Set up polling (e.g., every 5 seconds)
      pollingInterval = setInterval(() => {
        console.log(`Polling for new messages in conversation ${selectedConversation.id}`);
        fetchMessages(selectedConversation.id);
      }, 5000); // Poll every 5 seconds
    } else {
      setMessages([]); // Clear messages when no conversation is selected
    }

    // Clean up interval on component unmount or when selectedConversation changes
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedConversation]); // Dependency on selectedConversation

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);


  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/conversations', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      const sentMessage: Message = data.message;

      // Add the new message to the state
      setMessages(prev => [...prev, sentMessage]);

      // Update the last message in the conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            lastMessage: sentMessage,
            updatedAt: sentMessage.createdAt // Update updatedAt to reflect the new message time
          };
        }
        return conv;
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())); // Re-sort conversations


      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };


  // JSX Structure
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1"> {/* Only one tab now */}
            <TabsTrigger value="product-chats">Product Chats ({conversations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="product-chats" className="h-[calc(100vh-200px)] overflow-y-auto">
            {/* Product Chat List */}
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p>No product chats yet.</p>
              </div>
            ) : (
              <ul>
                {conversations.map(conversation => (
                  <li
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    {/* Display Product Chat Info */}
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        {conversation.ad.images && conversation.ad.images[0] ? (
                          <Image src={conversation.ad.images[0]} alt={conversation.ad.title} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold truncate">{conversation.ad.title}</p>
                        {/* Display last message if available */}
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {/* Display time since last message if available */}
                        {conversation.lastMessage && formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </div>
                      {/* Unread count logic would need to be implemented in the backend and fetched */}
                      {/* For now, removing the old unread count display */}
                      {/* {(chat.participants?.find(p => p.user.id === session?.id)?.unreadCount ?? 0) > 0 && (
                        <Badge variant="destructive">{chat.participants.find(p => p.user.id === session?.id)?.unreadCount}</Badge>
                      )} */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 flex flex-col">
        {/* Chat Display Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Product Chat Header */}
            <div className="border-b p-4 flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {selectedConversation.ad.images && selectedConversation.ad.images[0] ? (
                  <Image src={selectedConversation.ad.images[0]} alt={selectedConversation.ad.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold">{selectedConversation.ad.title}</h3>
            </div>

            {/* Product Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingMessages ? (
                 <div className="flex justify-center items-center h-full">
                   <Loader2 className="h-8 w-8 animate-spin" />
                 </div>
              ) : messages.length === 0 ? (
                 <div className="flex justify-center items-center h-full">
                   <p>No messages in this conversation yet.</p>
                 </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.senderId === session?.id ? 'text-right' : 'text-left'}`}
                  >
                    <span className={`inline-block p-2 rounded-lg ${message.senderId === session?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {message.content}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Product Message Input */}
            <div className="border-t p-4">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a chat to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}