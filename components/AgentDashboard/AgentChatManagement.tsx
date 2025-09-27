"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/SessionWrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  User,
  Search,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  isAgentReply: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupportChat {
  id: string;
  subject: string;
  category: string;
  priority: number;
  status: string;
  attachments: string[];
  userId: string;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  agent: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  messages: ChatMessage[];
}

interface ChatDetail {
  chat: SupportChat;
  messages: ChatMessage[];
}

export default function AgentChatManagement() {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChats, setPendingChats] = useState<SupportChat[]>([]);
  const [activeChats, setActiveChats] = useState<SupportChat[]>([]);
  const [closedChats, setClosedChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showChatDetail, setShowChatDetail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch chats
  useEffect(() => {
    fetchChats();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchChats, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);

      const [pendingRes, activeRes, closedRes] = await Promise.all([
        fetch('/api/agent/chats?status=pending', { credentials: 'include' }),
        fetch('/api/agent/chats?status=active', { credentials: 'include' }),
        fetch('/api/agent/chats?status=closed', { credentials: 'include' })
      ]);

      if (pendingRes.ok && activeRes.ok && closedRes.ok) {
        const [pending, active, closed] = await Promise.all([
          pendingRes.json(),
          activeRes.json(),
          closedRes.json()
        ]);

        setPendingChats(pending);
        setActiveChats(active);
        setClosedChats(closed);
      } else {
        throw new Error('Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/agent/chats/${chatId}/messages`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data: ChatDetail = await response.json();
        setChatMessages(data.messages);
        setSelectedChat(data.chat);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const acceptChat = async (chatId: string) => {
    try {
      const response = await fetch('/api/agent/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, action: 'accept' }),
        credentials: 'include'
      });

      if (response.ok) {
        const acceptedChat: SupportChat = await response.json();

        // Remove from pending and add to active
        setPendingChats(prev => prev.filter(chat => chat.id !== chatId));
        setActiveChats(prev => [acceptedChat, ...prev]);

        toast.success('Chat accepted successfully');

        // Auto-open the accepted chat
        setSelectedChat(acceptedChat);
        setActiveTab('active');
        fetchChatMessages(chatId);
        setShowChatDetail(true);
      } else {
        throw new Error('Failed to accept chat');
      }
    } catch (error) {
      console.error('Error accepting chat:', error);
      toast.error('Failed to accept chat');
    }
  };

  const closeChat = async (chatId: string) => {
    try {
      const response = await fetch('/api/agent/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, action: 'close' }),
        credentials: 'include'
      });

      if (response.ok) {
        const closedChat: SupportChat = await response.json();

        // Remove from active and add to closed
        setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
        setClosedChats(prev => [closedChat, ...prev]);

        toast.success('Chat closed successfully');

        // Close chat detail if this was the selected chat
        if (selectedChat?.id === chatId) {
          setShowChatDetail(false);
          setSelectedChat(null);
          setChatMessages([]);
        }

        setActiveTab('closed');
      } else {
        throw new Error('Failed to close chat');
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Failed to close chat');
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      const response = await fetch(`/api/agent/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        const message: ChatMessage = await response.json();
        setChatMessages(prev => [...prev, message]);
        setNewMessage('');

        // Update the chat's updated timestamp in local state
        const updatedChat = { ...selectedChat, updatedAt: new Date().toISOString() };
        setSelectedChat(updatedChat);
        setActiveChats(prev => prev.map(chat =>
          chat.id === selectedChat.id ? updatedChat : chat
        ));

        toast.success('Message sent successfully');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openChatDetail = (chat: SupportChat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.id);
    setShowChatDetail(true);
  };

  const closeChatDetail = () => {
    setShowChatDetail(false);
    setSelectedChat(null);
    setChatMessages([]);
  };

  // Filter chats based on search term
  const filterChats = (chats: SupportChat[]) => {
    if (!searchTerm) return chats;

    return chats.filter(chat =>
      chat.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return <Badge variant="destructive">High</Badge>;
      case 2:
        return <Badge variant="default">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const ChatList = ({ chats, showActions = false }: { chats: SupportChat[], showActions?: boolean }) => (
    <div className="space-y-3">
      {filterChats(chats).map(chat => (
        <Card
          key={chat.id}
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            selectedChat?.id === chat.id ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => openChatDetail(chat)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium truncate">{chat.subject}</h3>
                  <span className="text-xs text-gray-400">#{chat.id.slice(-6)}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{chat.user.name}</span>
                  <Mail className="w-4 h-4 text-gray-400 ml-2" />
                  <span className="text-xs text-gray-500">{chat.user.email}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(chat.status)}
                  {getPriorityBadge(chat.priority)}
                  <Badge variant="outline" className="text-xs">{chat.category}</Badge>
                </div>

                {chat.messages && chat.messages.length > 0 && (
                  <p className="text-sm text-gray-600 truncate mt-2">
                    <span className="font-medium">
                      {chat.messages[0].isAgentReply ? 'You: ' : `${chat.user.name}: `}
                    </span>
                    {chat.messages[0].content}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 ml-4">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(chat.updatedAt)}
                </span>

                {showActions && (
                  <div className="flex gap-1">
                    {chat.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptChat(chat.id);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                    )}
                    {chat.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeChat(chat.id);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Close
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filterChats(chats).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>No chats found</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
          <p className="text-gray-500 mt-1">Manage customer support conversations</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchChats}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search chats by subject, customer name, or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{pendingChats.length}</p>
              <p className="text-sm text-gray-500">Pending Chats</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <MessageSquare className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{activeChats.length}</p>
              <p className="text-sm text-gray-500">Active Chats</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{closedChats.length}</p>
              <p className="text-sm text-gray-500">Closed Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chats Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingChats.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Active ({activeChats.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Closed ({closedChats.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ChatList chats={pendingChats} showActions={true} />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ChatList chats={activeChats} showActions={true} />
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          <ChatList chats={closedChats} showActions={false} />
        </TabsContent>
      </Tabs>

      {/* Chat Detail Modal */}
      <Dialog open={showChatDetail} onOpenChange={setShowChatDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          {selectedChat && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedChat.subject}</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedChat.status)}
                    {getPriorityBadge(selectedChat.priority)}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Customer: {selectedChat.user.name}</span>
                    <span>Email: {selectedChat.user.email}</span>
                    <span>Category: {selectedChat.category}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isAgentReply ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.isAgentReply
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.isAgentReply ? 'You' : message.sender.name}
                              </span>
                              <span className="text-xs opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                {selectedChat.status === 'active' && (
                  <div className="flex-shrink-0 border-t pt-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSendingMessage}
                        className="px-6"
                      >
                        {isSendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedChat.status === 'active' && (
                <DialogFooter className="flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => closeChat(selectedChat.id)}
                  >
                    Close Chat
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}