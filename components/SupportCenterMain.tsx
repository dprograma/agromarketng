"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Using standard divs for scrollable areas and separators
import {
  HelpCircle,
  Ticket,
  Plus,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { faqData, helpTabs } from "@/constants";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  subject: string;
  priority: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
}

interface SupportMessage {
  id: string;
  content: string;
  isAgentReply: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

interface FAQ {
  question: string;
  answer: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function SupportCenterMain() {
  const [activeTab, setActiveTab] = useState("faq");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: ""
  });

  // FAQ search functionality
  const filteredFAQ = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/support/tickets", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast.error("Failed to load support tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific ticket
  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        credentials: "include",
      });

      if (response.ok) {
        const messages = await response.json();
        setTicketMessages(messages);
      } else {
        toast.error("Failed to load ticket messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load ticket messages");
    }
  };

  // Create new support ticket
  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim() || !newTicket.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTicket),
        credentials: "include",
      });

      if (response.ok) {
        const ticket = await response.json();
        setTickets([ticket, ...tickets]);
        setNewTicket({
          subject: "",
          category: "",
          priority: "medium",
          message: ""
        });
        setShowCreateForm(false);
        toast.success("Support ticket created successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create support ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create support ticket");
    } finally {
      setCreating(false);
    }
  };

  // Send message to ticket
  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedTicket) return;

    try {
      setSendingMessage(true);
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          isAgentReply: false
        }),
        credentials: "include",
      });

      if (response.ok) {
        const message = await response.json();
        setTicketMessages([...ticketMessages, message]);
        setMessageContent("");
        toast.success("Message sent successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">🎧 Support Center</h2>
          <p className="text-gray-600 mt-1">Get help, find answers, and manage support tickets</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          {helpTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition",
                  activeTab === tab.key
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Frequently Asked Questions
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQ..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQ.length > 0 ? (
                  filteredFAQ.map((faq, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900">{faq.question}</h3>
                        {expandedFAQ === index ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-4 pb-4">
                          <hr className="mb-3 border-gray-200" />
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No FAQ items found matching your search.</p>
                  </div>
                )}
              </div>

              {faqSearch === "" && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Still need help?</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    If you couldn't find the answer you're looking for, you can create a support ticket and our team will help you.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tickets")}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Create Support Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-green-600" />
                    Support Tickets
                  </CardTitle>
                  <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Create Ticket Form */}
                {showCreateForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-4">Create New Support Ticket</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <Input
                          placeholder="Brief description of your issue"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <Select
                            value={newTicket.category}
                            onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="billing">Billing Question</SelectItem>
                              <SelectItem value="account">Account Help</SelectItem>
                              <SelectItem value="general">General Question</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                          </label>
                          <Select
                            value={newTicket.priority}
                            onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <Textarea
                          placeholder="Please describe your issue in detail..."
                          value={newTicket.message}
                          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createTicket}
                          disabled={creating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Create Ticket
                        </Button>
                        <Button
                          onClick={() => setShowCreateForm(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tickets List */}
                <div className="h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-colors",
                            selectedTicket?.id === ticket.id
                              ? "border-green-500 bg-green-50"
                              : "hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {ticket.subject}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {ticket.category} • {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No support tickets yet.</p>
                      <p className="text-sm mt-1">Create your first ticket to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  {selectedTicket ? "Conversation" : "Select a Ticket"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTicket ? (
                  <div className="space-y-4">
                    {/* Ticket Header */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority} priority
                        </Badge>
                        <Badge className={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          • {selectedTicket.category}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {ticketMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "p-3 rounded-lg",
                              message.isAgentReply
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "bg-gray-50 border-l-4 border-gray-300"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {message.isAgentReply ? "Support Agent" : message.sender.name || "You"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply Form */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="border-t pt-4">
                        <Textarea
                          placeholder="Type your message here..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            onClick={sendMessage}
                            disabled={sendingMessage || !messageContent.trim()}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {sendingMessage ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Message
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a support ticket to view the conversation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}