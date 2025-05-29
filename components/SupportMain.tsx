"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Send, Paperclip, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { faqData, helpTabs } from "@/constants";
import { useSession } from "@/components/SessionWrapper";
import { io, Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";

interface SupportMessage {
  id: string;
  content: string;
  sender: string;
  senderType: 'user' | 'agent';
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface SupportChat {
  id: string;
  userId: string;
  agentId: string | null;
  status: 'pending' | 'active' | 'closed';
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

interface Ticket {
  subject: string;
  message: string;
  attachments?: File[];
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export default function SupportCenter() {
  const { session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState("faq");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Support ticket form state
  const [ticket, setTicket] = useState<Ticket>({
    subject: "",
    message: "",
    attachments: [],
    priority: "medium",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live chat state
  const [chatMessage, setChatMessage] = useState("");
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ticketCategories = [
    "General Inquiry",
    "Technical Support",
    "Billing Issue",
    "Feature Request",
    "Bug Report"
  ];

  // Initialize socket connection
  useEffect(() => {
    if (session?.token) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
        path: '/api/socketio',
        auth: {
          token: session.token,
          role: 'user'
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'] // Explicitly specify transports
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
        fetchSupportChats();
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Support chat messages
      socketInstance.on('support_message', (data: { chatId: string, message: SupportMessage }) => {
        if (selectedChat && selectedChat.id === data.chatId) {
          setSupportMessages(prev => [...prev, data.message]);
        }

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

      // Agent accepted chat
      socketInstance.on('agent_accepted', (data: { chatId: string, agentId: string, agentName: string, message: SupportMessage }) => {
        if (selectedChat && selectedChat.id === data.chatId) {
          setSelectedChat(prev => prev ? {
            ...prev,
            agentId: data.agentId,
            status: 'active',
            agent: {
              user: {
                name: data.agentName,
                email: ''
              }
            }
          } : null);

          setSupportMessages(prev => [...prev, data.message]);
        }

        // Update the chat in the list
        setSupportChats(prev => prev.map(chat => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              agentId: data.agentId,
              status: 'active',
              agent: {
                user: {
                  name: data.agentName,
                  email: ''
                }
              },
              messages: [...chat.messages, data.message]
            };
          }
          return chat;
        }));

        toast.success(`Agent ${data.agentName} has accepted your chat`);
      });

      // Chat closed
      socketInstance.on('support_chat_closed', (data: { chatId: string, closedBy: string, closedByRole: string, message: SupportMessage }) => {
        if (selectedChat && selectedChat.id === data.chatId) {
          setSelectedChat(prev => prev ? {
            ...prev,
            status: 'closed'
          } : null);

          setSupportMessages(prev => [...prev, data.message]);
        }

        // Update the chat in the list
        setSupportChats(prev => prev.map(chat => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              status: 'closed',
              messages: [...chat.messages, data.message]
            };
          }
          return chat;
        }));

        toast.success(`Chat has been closed by ${data.closedByRole}`);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session, selectedChat]);

  // Fetch support chats
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
      toast.error('Failed to fetch support chats');
    }
  };

  // Fetch messages for a specific support chat
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
      console.error('Error fetching support messages:', error);
      toast.error('Failed to fetch support messages');
    }
  };

  // Effect to fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchSupportMessages(selectedChat.id);

      // Join the support chat room
      if (socket) {
        socket.emit('join_support_chat', selectedChat.id);
      }

      return () => {
        // Leave the support chat room when component unmounts or chat changes
        if (socket) {
          socket.emit('leave_support_chat', selectedChat.id);
        }
      };
    }
  }, [selectedChat, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [supportMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitTicket = async () => {
    if (!ticket.subject || !ticket.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("subject", ticket.subject);
      formData.append("message", ticket.message);
      formData.append("priority", ticket.priority);
      formData.append("category", ticket.category);

      if (ticket.attachments) {
        ticket.attachments.forEach(file => {
          formData.append("attachments", file);
        });
      }

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      await response.json();
      toast.success("Support ticket submitted successfully");
      setTicket({
        subject: "",
        message: "",
        attachments: [],
        priority: "medium",
        category: "general"
      });
    } catch (error) {
      toast.error("Failed to submit ticket. Please try again.");
      console.error('Error submitting ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTicket(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setTicket(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
  };

  // Send a message in the current support chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !chatMessage.trim() || !socket) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/user/support-chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chatMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const message = await response.json();

      // Emit message through socket
      socket.emit('support_message', {
        chatId: selectedChat.id,
        message
      });

      setSupportMessages(prev => [...prev, message]);
      setChatMessage("");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Create a new support chat
  const createSupportChat = async () => {
    if (!socket) {
      toast.error('Connection error. Please refresh the page.');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Create a new support chat via API
      const response = await fetch('/api/user/support-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'general',
          priority: 1
        }),
      });

      if (!response.ok) throw new Error('Failed to create support chat');
      const chat = await response.json();

      // Set the newly created chat as selected
      setSelectedChat(chat);

      // Add to the list of chats
      setSupportChats(prev => [chat, ...prev]);

      // Switch to the live chat tab
      setActiveTab('livechat');

      toast.success('Support chat created. An agent will assist you shortly.');
    } catch (error) {
      console.error('Error creating support chat:', error);
      toast.error('Failed to create support chat. Please try again.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Close the current support chat
  const closeSupportChat = async (reason?: string) => {
    if (!selectedChat || !socket) return;

    try {
      socket.emit('close_support_chat', {
        chatId: selectedChat.id,
        reason
      });

      // The socket handler will update the UI
    } catch (error) {
      console.error('Error closing support chat:', error);
      toast.error('Failed to close the chat. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📞 Support Center</h2>
      <p className="text-gray-600 text-center mt-2">Need help? Find answers or reach out to us.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {helpTabs.map(({ key, label, icon }) => (
          <button
            key={key}
            className={cn(
              "px-6 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2",
              activeTab === key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            )}
            onClick={() => setActiveTab(key)}
          >
            {React.createElement(icon, { className: "w-4 h-4" })} {label}
          </button>
        ))}
        <button
          className={cn(
            "px-6 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2",
            activeTab === "livechat"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-green-500"
          )}
          onClick={() => setActiveTab("livechat")}
        >
          <MessageSquare className="w-4 h-4" /> Live Chat
        </button>
      </div>

      {/* FAQ Section */}
      {activeTab === "faq" && (
        <div className="mt-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mt-4 space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border rounded-md p-3 hover:border-green-500 transition-colors">
                <button
                  className="flex justify-between w-full text-left font-semibold text-gray-800"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.question}
                  <ChevronDown
                    className={cn("transition-transform", faqOpen === index && "rotate-180")}
                  />
                </button>
                {faqOpen === index && (
                  <div className="mt-2">
                    <p className="text-gray-600">{faq.answer}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Was this helpful?
                      <button className="ml-2 text-green-600 hover:text-green-700">Yes</button>
                      <button className="ml-2 text-red-600 hover:text-red-700">No</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Ticket Form */}
      {activeTab === "tickets" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">🎫 Submit a Support Ticket</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                className="mt-1 w-full p-2 border rounded-md"
              >
                {ticketCategories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => setTicket({ ...ticket, priority: e.target.value as Ticket['priority'] })}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                className="mt-1 w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <div className="mt-1 flex items-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center text-sm text-gray-600 hover:text-green-600"
                >
                  <Paperclip className="w-4 h-4 mr-1" />
                  Add files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
              </div>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {ticket.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
              className={cn(
                "w-full py-2 px-4 rounded-md text-white transition",
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Live Chat Section */}
      {activeTab === "livechat" && (
        <div className="mt-6 flex h-[600px] border rounded-md overflow-hidden">
          {/* Chat List */}
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-medium text-gray-800">Support Chats</h3>
              <button
                onClick={createSupportChat}
                disabled={isCreatingChat}
                className={cn(
                  "mt-2 w-full py-2 px-4 rounded-md text-white text-sm transition",
                  isCreatingChat
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isCreatingChat ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "New Support Chat"
                )}
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(600px-65px)]">
              {supportChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No support chats found</p>
                  <p className="text-sm mt-2">Click "New Support Chat" to get started</p>
                </div>
              ) : (
                supportChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-100 transition",
                      selectedChat?.id === chat.id ? "bg-gray-100" : ""
                    )}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {chat.agent ? `Agent: ${chat.agent.user.name}` : 'Waiting for agent...'}
                          </span>
                          {chat.status === 'pending' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                          {chat.status === 'active' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                          {chat.status === 'closed' && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {chat.messages[0]?.content || "No messages yet"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Support Chat</h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.agent ?
                        `with Agent: ${selectedChat.agent.user.name}` :
                        'Waiting for agent...'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      selectedChat.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                        selectedChat.status === 'active' ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                    )}>
                      {selectedChat.status.charAt(0).toUpperCase() + selectedChat.status.slice(1)}
                    </span>

                    {selectedChat.status !== 'closed' && (
                      <button
                        onClick={() => closeSupportChat()}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Close Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {supportMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  supportMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "mb-4 flex",
                        message.senderType === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          message.senderType === 'user'
                            ? "bg-green-600 text-white"
                            : "bg-white border"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={selectedChat.status === 'closed'
                      ? "This chat is closed"
                      : "Type a message..."}
                    className="flex-1 p-2 border rounded-md"
                    disabled={selectedChat.status === 'closed' || isSending}
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || selectedChat.status === 'closed' || isSending}
                    className={cn(
                      "py-2 px-4 rounded-md text-white transition",
                      !chatMessage.trim() || selectedChat.status === 'closed' || isSending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {selectedChat.status === 'closed' && (
                  <p className="mt-2 text-xs text-center text-red-500">
                    This chat is closed. You cannot send messages.
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Select a chat or create a new one</p>
                <button
                  onClick={createSupportChat}
                  disabled={isCreatingChat}
                  className={cn(
                    "py-2 px-4 rounded-md text-white transition",
                    isCreatingChat
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isCreatingChat ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "New Support Chat"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}