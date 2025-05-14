"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/SessionWrapper";
import { io, Socket } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  senderType: string;
  createdAt: string;
  read: boolean;
}

interface Chat {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
  category: string;
  priority: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function AgentDashboard() {
  const { session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [pendingChats, setPendingChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats on component mount
  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  // Setup socket connection
  useEffect(() => {
    if (!session) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin, {
      path: '/api/socketio',
      auth: {
        token: session.token,
        role: 'agent'
      }
    });

    socketInstance.on('connect', () => {
      console.log('Agent connected to WebSocket');
      setIsOnline(true);
      setIsLoading(false);

      // Update agent status in database
      updateAgentStatus(true);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsLoading(false);
    });

    socketInstance.on('disconnect', () => {
      setIsOnline(false);
      // Update agent status in database
      updateAgentStatus(false);
    });

    socketInstance.on('new_support_request', (chat: Chat) => {
      setPendingChats(prev => {
        // Check if chat already exists
        if (prev.some(c => c.id === chat.id)) {
          return prev;
        }
        return [...prev, chat];
      });

      // Show notification
      toast.success('New support request received');
    });

    socketInstance.on('user_message', ({ chatId, message }) => {
      // Update chat messages
      setActiveChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );

      // Update selected chat if it's the current one
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev =>
          prev ? { ...prev, messages: [...prev.messages, message] } : null
        );
      }

      // Show notification if not the selected chat
      if (selectedChat?.id !== chatId) {
        toast.success('New message received');
      }
    });

    setSocket(socketInstance);

    return () => {
      // Update agent status before disconnecting
      updateAgentStatus(false);
      socketInstance.disconnect();
    };
  }, [session]);

  // Function to update agent status
  const updateAgentStatus = async (isAvailable: boolean) => {
    try {
      await fetch('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable })
      });
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  // Function to fetch chats
  const fetchChats = async () => {
    try {
      // Fetch active chats
      const activeResponse = await fetch('/api/agent/chats?status=active', {
        credentials: 'include'
      });

      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setActiveChats(activeData);
      }

      // Fetch pending chats
      const pendingResponse = await fetch('/api/agent/chats?status=pending', {
        credentials: 'include'
      });

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingChats(pendingData);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to accept a chat
  const acceptChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/agent/chats/${chatId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const chat = await response.json();

        // Remove from pending chats
        setPendingChats(prev => prev.filter(c => c.id !== chatId));

        // Add to active chats
        setActiveChats(prev => [...prev, chat]);

        // Select the chat
        setSelectedChat(chat);

        toast.success('Chat accepted');
      } else {
        throw new Error('Failed to accept chat');
      }
    } catch (error) {
      console.error('Error accepting chat:', error);
      toast.error('Failed to accept chat');
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (!selectedChat || !message.trim() || !socket) return;

    try {
      const response = await fetch(`/api/agent/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: message })
      });

      if (response.ok) {
        const newMessage = await response.json();

        // Update selected chat
        setSelectedChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });

        // Update active chats
        setActiveChats(prev =>
          prev.map(chat =>
            chat.id === selectedChat.id
              ? {
                ...chat,
                messages: [...chat.messages, newMessage]
              }
              : chat
          )
        );

        // Emit message to socket
        socket.emit('agent_message', {
          chatId: selectedChat.id,
          message: newMessage
        });

        // Clear message input
        setMessage('');
      } else {
        throw new Error('Failed to send message');
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
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Active ({activeChats.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingChats.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-2">
              {activeChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer ${selectedChat?.id === chat.id ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{chat.user.name}</span>
                    <Badge variant="outline">{chat.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.messages[chat.messages.length - 1]?.content}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
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
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedChat.user.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedChat.category}</Badge>
                  <Badge variant="outline">
                    Priority: {selectedChat.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-4 ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${msg.senderType === 'agent'
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
            <p className="text-gray-500">Select a chat to start responding</p>
          </div>
        )}
      </div>
    </div>
  );
}