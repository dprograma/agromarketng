"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { useSession } from "@/components/SessionWrapper";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Message, Chat } from "@/types";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


interface SupportMessage {
  id: string;
  content: string;
  sender: string;
  senderType: 'user' | 'agent';
  createdAt: string;
  read: boolean;
}

interface SupportChat {
  id: string;
  userId: string;
  agentId: string | null;
  status: string;
  category: string;
  priority: number;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  agent?: {
    user: {
      name: string;
      email: string;
    };
  } | null;
}

export default function Messages() {
  const searchParams = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState("product-chats");

  // Product chats (user-to-user)
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Support chats (user-to-agent)
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [selectedSupportChat, setSelectedSupportChat] = useState<SupportChat | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [newSupportMessage, setNewSupportMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const scrollToSupportBottom = () => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize socket connection
  useEffect(() => {
    if (session?.token) {
      const socketInstance = io({
        path: '/api/socketio',
        auth: {
          token: session.token,
          role: 'user'
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Product chat messages
      socketInstance.on('message_received', (newMessage: Message) => {
        setMessages(prev => [...prev, newMessage]);
      });

      // Support chat messages
      socketInstance.on('support_message', (data: { chatId: string, message: SupportMessage }) => {
        setSupportMessages(prev => [...prev, data.message]);

        // Update the chat with the new message
        setSupportChats(prev => prev.map(chat => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              messages: [...chat.messages, data.message],
              updatedAt: new Date().toISOString()
            };
          }
          return chat;
        }));
      });

      // Notification for new support chat
      socketInstance.on('support_chat_created', (chat: SupportChat) => {
        setSupportChats(prev => [chat, ...prev]);
        toast.success('New support chat created');
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session]);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  }, [chats, searchParams]);

  // Join chat room when selecting a chat
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join_chat', selectedChat.id);

      return () => {
        socket.emit('leave_chat', selectedChat.id);
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    if (session) {
      fetchAllChats();
    }
  }, [session]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedSupportChat) {
      fetchSupportMessages(selectedSupportChat.id);
    }
  }, [selectedSupportChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToSupportBottom();
  }, [supportMessages]);

  const fetchAllChats = async () => {
    setIsLoading(true);
    try {
      // Fetch product chats
      await fetchChats();

      // Fetch support chats
      await fetchSupportChats();
    } catch (error) {
      console.error('Error fetching all chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching product chats:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch chats');
    }
  };

  const fetchSupportChats = async () => {
    try {
      const response = await fetch('/api/user/support-chats', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch support chats');
      }

      const data = await response.json();
      setSupportChats(data);
    } catch (error) {
      console.error('Error fetching support chats:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch support chats');
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch messages');
    }
  };

  const fetchSupportMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/user/support-chats/${chatId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch support messages');
      }

      const data = await response.json();
      setSupportMessages(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch support messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim() || !socket) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const message = await response.json();

      // Emit message through socket
      socket.emit('new_message', {
        chatId: selectedChat.id,
        message
      });

      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const sendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupportChat || !newSupportMessage.trim() || !socket) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/user/support-chats/${selectedSupportChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newSupportMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const message = await response.json();

      // Emit message through socket
      socket.emit('support_message', {
        chatId: selectedSupportChat.id,
        message
      });

      setSupportMessages(prev => [...prev, message]);
      setNewSupportMessage("");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Tabs defaultValue="product-chats" className="w-full" onValueChange={setActiveTab}>
        <div className="bg-white p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product-chats" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Product Chats
            </TabsTrigger>
            <TabsTrigger value="support-chats" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Support Chats
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="product-chats" className="flex-1 flex overflow-hidden">
          {/* Product Chat List */}
          <div className="w-1/3 bg-white border-r">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Product Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-10rem)]">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No product chats found</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat?.id === chat.id ? "bg-gray-50" : ""
                      }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={chat.ad.images[0] || "/placeholder.png"}
                        alt={chat.ad.title}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{chat.ad.title}</h3>
                        <p className="text-gray-500 text-xs">
                          {chat.messages[0]?.content || "No messages yet"}
                        </p>
                      </div>
                      {chat.participants[0].unreadCount > 0 && (
                        <Badge variant="secondary">
                          {chat.participants[0].unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Product Chat Messages */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-white">
                <h3 className="font-medium">{selectedChat.ad.title}</h3>
                <p className="text-sm text-gray-500">
                  with {selectedChat.participants[0].user.name}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${message.senderId === session?.id
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${message.senderId === session?.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="support-chats" className="flex-1 flex overflow-hidden">
          {/* Support Chat List */}
          <div className="w-1/3 bg-white border-r">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Support Chats</h2>
              <Button
                onClick={() => {
                  // Create new support chat
                  if (socket) {
                    socket.emit('support_message', {
                      content: 'I need help with my account',
                      userId: session?.id
                    });
                    toast.success('Support request sent. An agent will be with you shortly.');
                  }
                }}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-sm py-1"
              >
                New Support Request
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-12rem)]">
              {supportChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No support chats found</p>
                </div>
              ) : (
                supportChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedSupportChat?.id === chat.id ? "bg-gray-50" : ""
                      }`}
                    onClick={() => setSelectedSupportChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">Support Chat</h3>
                        <p className="text-gray-500 text-xs">
                          {chat.messages[0]?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge
                          variant={
                            chat.status === 'pending' ? 'secondary' :
                              chat.status === 'active' ? 'default' : 'outline'
                          }
                          className="mb-1"
                        >
                          {chat.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Support Chat Messages */}
          {selectedSupportChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Support Chat</h3>
                    <p className="text-sm text-gray-500">
                      {selectedSupportChat.agent ?
                        `with Agent: ${selectedSupportChat.agent.user.name}` :
                        'Waiting for agent...'
                      }
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedSupportChat.status === 'pending' ? 'secondary' :
                        selectedSupportChat.status === 'active' ? 'default' : 'outline'
                    }
                  >
                    {selectedSupportChat.status}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {supportMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${message.senderType === 'user'
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${message.senderType === 'user'
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={supportMessagesEndRef} />
              </div>

              <form onSubmit={sendSupportMessage} className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newSupportMessage}
                    onChange={(e) => setNewSupportMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={selectedSupportChat.status === 'closed'}
                  />
                  <Button
                    type="submit"
                    disabled={isSending || !newSupportMessage.trim() || selectedSupportChat.status === 'closed'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {selectedSupportChat.status === 'closed' && (
                  <p className="text-xs text-center mt-2 text-red-500">
                    This support chat is closed. You cannot send messages.
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Select a support chat or create a new one</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}