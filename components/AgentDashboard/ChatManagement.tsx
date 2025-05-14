"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/SessionWrapper";
import { io, Socket } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Clock,
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  user: {
    name: string;
    email: string;
  };
  messages: ChatMessage[];
  status: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatManagement() {
  const { session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [pendingChats, setPendingChats] = useState<Chat[]>([]);
  const [closedChats, setClosedChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [quickReplies, setQuickReplies] = useState([
    "Thank you for contacting us. How can I help you today?",
    "I understand your concern. Let me help you with that.",
    "Could you please provide more details about the issue?",
    "I'm checking your account information now. One moment please.",
    "Is there anything else I can assist you with today?",
  ]);

  // Fetch chats on component mount
  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

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

    // Listen for new chats
    socketInstance.on('new_support_chat', (chat: Chat) => {
      setPendingChats(prev => [chat, ...prev]);
      toast.success('New support chat received');
    });

    // Listen for new messages
    socketInstance.on('new_support_message', (data: { chatId: string, message: ChatMessage }) => {
      // Update chat with new message
      setActiveChats(prev => prev.map(chat => {
        if (chat.id === data.chatId) {
          return {
            ...chat,
            messages: [...chat.messages, data.message],
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      }));

      // If this is the selected chat, scroll to bottom
      if (selectedChat?.id === data.chatId) {
        scrollToBottom();
      } else {
        // Notify about new message in another chat
        toast.success(`New message in chat with ${activeChats.find(c => c.id === data.chatId)?.user.name}`);
      }
    });

    // Listen for chat status updates
    socketInstance.on('chat_status_update', (data: { chatId: string, status: string }) => {
      handleChatStatusUpdate(data.chatId, data.status);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active chats
      const activeResponse = await fetch('/api/agent/chats?status=active', {
        credentials: 'include'
      });
      
      // Fetch pending chats
      const pendingResponse = await fetch('/api/agent/chats?status=pending', {
        credentials: 'include'
      });
      
      // Fetch closed chats
      const closedResponse = await fetch('/api/agent/chats?status=closed', {
        credentials: 'include'
      });

      if (!activeResponse.ok || !pendingResponse.ok || !closedResponse.ok) {
        throw new Error('Failed to fetch chats');
      }

      const activeData = await activeResponse.json();
      const pendingData = await pendingResponse.json();
      const closedData = await closedResponse.json();

      setActiveChats(activeData);
      setPendingChats(pendingData);
      setClosedChats(closedData);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAgentStatus = async (isOnline: boolean) => {
    try {
      const response = await fetch('/api/agent/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isOnline }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleAcceptChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/agent/chats/${chatId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to accept chat');
      }

      const acceptedChat = await response.json();
      
      // Remove from pending and add to active
      setPendingChats(prev => prev.filter(chat => chat.id !== chatId));
      setActiveChats(prev => [acceptedChat, ...prev]);
      
      // Select the newly accepted chat
      setSelectedChat(acceptedChat);
      setActiveTab("active");
      
      toast.success('Chat accepted successfully');
    } catch (error) {
      console.error('Error accepting chat:', error);
      toast.error('Failed to accept chat');
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/agent/chats/${chatId}/close`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to close chat');
      }

      const closedChat = await response.json();
      
      // Remove from active and add to closed
      setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
      setClosedChats(prev => [closedChat, ...prev]);
      
      // If this was the selected chat, clear selection
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
      
      toast.success('Chat closed successfully');
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Failed to close chat');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !message.trim()) return;

    try {
      const response = await fetch(`/api/agent/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Update the selected chat with the new message
      setSelectedChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date().toISOString()
        };
      });
      
      // Also update in the active chats list
      setActiveChats(prev => prev.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      }));
      
      // Clear the message input
      setMessage('');
      
      // Emit the message to the socket
      socket?.emit('new_support_message', {
        chatId: selectedChat.id,
        message: newMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleChatStatusUpdate = (chatId: string, status: string) => {
    // Handle chat status updates from socket
    if (status === 'active') {
      // Move from pending to active
      const chat = pendingChats.find(c => c.id === chatId);
      if (chat) {
        setPendingChats(prev => prev.filter(c => c.id !== chatId));
        setActiveChats(prev => [chat, ...prev]);
      }
    } else if (status === 'closed') {
      // Move from active to closed
      const chat = activeChats.find(c => c.id === chatId);
      if (chat) {
        setActiveChats(prev => prev.filter(c => c.id !== chatId));
        setClosedChats(prev => [chat, ...prev]);
        
        // If this was the selected chat, clear selection
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      }
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
  };

  const addQuickReply = () => {
    if (message.trim()) {
      setQuickReplies(prev => [...prev, message.trim()]);
      toast.success('Quick reply added');
      setMessage('');
    }
  };

  const removeQuickReply = (index: number) => {
    setQuickReplies(prev => prev.filter((_, i) => i !== index));
  };

  // Filter chats based on search term and filters
  const filterChats = (chats: Chat[]) => {
    return chats.filter(chat => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || chat.category === categoryFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || chat.priority.toString() === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  };

  const filteredActiveChats = filterChats(activeChats);
  const filteredPendingChats = filterChats(pendingChats);
  const filteredClosedChats = filterChats(closedChats);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r overflow-hidden flex flex-col">
        {/* Search and Filters */}
        <div className="p-4 border-b">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search chats..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabs for chat status */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-2 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Active ({activeChats.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                <Clock className="w-4 h-4 mr-2" />
                Pending ({pendingChats.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Closed
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="active" className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredActiveChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No active chats</p>
              </div>
            ) : (
              filteredActiveChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedChat?.id === chat.id ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{chat.user.name}</span>
                    <Badge variant={chat.priority === 3 ? "destructive" : chat.priority === 2 ? "default" : "outline"}>
                      {chat.priority === 3 ? "High" : chat.priority === 2 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant="outline">{chat.category}</Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(chat.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredPendingChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No pending chats</p>
              </div>
            ) : (
              filteredPendingChats.map(chat => (
                <div
                  key={chat.id}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{chat.user.name}</span>
                    <Badge variant={chat.priority === 3 ? "destructive" : chat.priority === 2 ? "default" : "outline"}>
                      {chat.priority === 3 ? "High" : chat.priority === 2 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline">{chat.category}</Badge>
                    <Button size="sm" onClick={() => handleAcceptChat(chat.id)}>Accept</Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="closed" className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredClosedChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No closed chats</p>
              </div>
            ) : (
              filteredClosedChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedChat?.id === chat.id ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{chat.user.name}</span>
                    <Badge variant="outline">Closed</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant="outline">{chat.category}</Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(chat.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedChat.user.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedChat.category}</Badge>
                  <Badge variant={selectedChat.priority === 3 ? "destructive" : selectedChat.priority === 2 ? "default" : "outline"}>
                    Priority: {selectedChat.priority === 3 ? "High" : selectedChat.priority === 2 ? "Medium" : "Low"}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {selectedChat.status === 'active' && (
                        <DropdownMenuItem onClick={() => handleCloseChat(selectedChat.id)}>
                          Close Chat
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>View User Profile</DropdownMenuItem>
                      <DropdownMenuItem>Transfer Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Started: {formatDate(selectedChat.createdAt)}</span>
                <span>Status: {selectedChat.status.charAt(0).toUpperCase() + selectedChat.status.slice(1)}</span>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderType === 'agent'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick Replies */}
            {selectedChat.status === 'active' && (
              <div className="p-2 border-t flex gap-2 overflow-x-auto">
                {quickReplies.map((reply, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 whitespace-nowrap"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.length > 30 ? reply.substring(0, 30) + '...' : reply}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Message Input */}
            {selectedChat.status === 'active' ? (
              <div className="p-4 border-t flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button onClick={handleSendMessage} size="icon">
                    <Send size={18} />
                  </Button>
                  <Button onClick={addQuickReply} size="icon" variant="outline">
                    <ThumbsUp size={18} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t bg-gray-50 text-center text-gray-500">
                This chat is {selectedChat.status}. You cannot send messages.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No chat selected</h3>
            <p>Select a chat from the list or accept a pending chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
