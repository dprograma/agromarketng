"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/SessionWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TicketCheck,
  Clock,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  AlertCircle,
  MoreVertical,
  PlusCircle,
  FileText,
  Paperclip,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  category: string;
  status: string;
  attachments: string[];
  userId: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses?: TicketResponse[];
}

interface TicketResponse {
  id: string;
  content: string;
  ticketId: string;
  createdAt: string;
  createdBy: string;
  createdByType: string;
}

export default function TicketManagement() {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [closedTickets, setClosedTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tickets on component mount
  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active tickets
      const activeResponse = await fetch('/api/agent/tickets?status=active', {
        credentials: 'include'
      });
      
      // Fetch pending tickets
      const pendingResponse = await fetch('/api/agent/tickets?status=pending', {
        credentials: 'include'
      });
      
      // Fetch closed tickets
      const closedResponse = await fetch('/api/agent/tickets?status=closed', {
        credentials: 'include'
      });

      if (!activeResponse.ok || !pendingResponse.ok || !closedResponse.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const activeData = await activeResponse.json();
      const pendingData = await pendingResponse.json();
      const closedData = await closedResponse.json();

      setActiveTickets(activeData);
      setPendingTickets(pendingData);
      setClosedTickets(closedData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/agent/tickets/${ticketId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to accept ticket');
      }

      const acceptedTicket = await response.json();
      
      // Remove from pending and add to active
      setPendingTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setActiveTickets(prev => [acceptedTicket, ...prev]);
      
      // Select the newly accepted ticket
      setSelectedTicket(acceptedTicket);
      setActiveTab("active");
      
      toast.success('Ticket accepted successfully');
    } catch (error) {
      console.error('Error accepting ticket:', error);
      toast.error('Failed to accept ticket');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/agent/tickets/${ticketId}/close`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to close ticket');
      }

      const closedTicket = await response.json();
      
      // Remove from active and add to closed
      setActiveTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setClosedTickets(prev => [closedTicket, ...prev]);
      
      // If this was the selected ticket, clear selection
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      
      toast.success('Ticket closed successfully');
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !responseContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/agent/tickets/${selectedTicket.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: responseContent }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      const newResponse = await response.json();
      
      // Update the selected ticket with the new response
      setSelectedTicket(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responses: [...(prev.responses || []), newResponse],
          updatedAt: new Date().toISOString()
        };
      });
      
      // Also update in the active tickets list
      setActiveTickets(prev => prev.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            responses: [...(ticket.responses || []), newResponse],
            updatedAt: new Date().toISOString()
          };
        }
        return ticket;
      }));
      
      // Clear the response input
      setResponseContent('');
      toast.success('Response submitted successfully');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tickets based on search term and filters
  const filterTickets = (tickets: Ticket[]) => {
    return tickets.filter(ticket => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  };

  const filteredActiveTickets = filterTickets(activeTickets);
  const filteredPendingTickets = filterTickets(pendingTickets);
  const filteredClosedTickets = filterTickets(closedTickets);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return "destructive";
      case 'medium':
        return "default";
      default:
        return "outline";
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "default";
      case 'pending':
        return "secondary";
      case 'closed':
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Ticket Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
              <DialogDescription>
                Create a new ticket on behalf of a user or for internal purposes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User Email</label>
                <Input placeholder="user@example.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Brief description of the issue" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Detailed description of the issue" rows={4} />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button>Create Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tickets Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            <TicketCheck className="w-4 h-4 mr-2" />
            Active ({activeTickets.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Closed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActiveTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <TicketCheck className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No active tickets</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActiveTickets.map(ticket => (
                      <TableRow 
                        key={ticket.id}
                        className={selectedTicket?.id === ticket.id ? "bg-green-50" : ""}
                      >
                        <TableCell 
                          className="font-medium cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {ticket.subject}
                        </TableCell>
                        <TableCell>{ticket.user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="right">
                              <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCloseTicket(ticket.id)}>
                                Close Ticket
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No pending tickets</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPendingTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>{ticket.user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleAcceptTicket(ticket.id)}>
                            Accept
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="closed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Closed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClosedTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No closed tickets</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClosedTickets.map(ticket => (
                      <TableRow 
                        key={ticket.id}
                        className={selectedTicket?.id === ticket.id ? "bg-green-50" : ""}
                      >
                        <TableCell 
                          className="font-medium cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {ticket.subject}
                        </TableCell>
                        <TableCell>{ticket.user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Ticket Details */}
      {selectedTicket && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedTicket.subject}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusBadge(selectedTicket.status)}>
                  {selectedTicket.status}
                </Badge>
                <Badge variant={getPriorityBadge(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
                <Badge variant="outline">{selectedTicket.category}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedTicket(null)}
            >
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <div>
                <span className="font-medium">From:</span> {selectedTicket.user.name} ({selectedTicket.user.email})
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(selectedTicket.createdAt)}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
              
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center bg-white p-2 rounded border">
                        <Paperclip size={14} className="mr-2 text-gray-500" />
                        <span className="text-sm">{attachment.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Responses */}
            {selectedTicket.responses && selectedTicket.responses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Responses</h3>
                {selectedTicket.responses.map((response) => (
                  <div key={response.id} className="p-4 rounded-lg border">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {response.createdByType === 'agent' ? 'Agent Response' : 'User Response'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{response.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Response Form */}
            {selectedTicket.status === 'active' && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Add Response</h3>
                <Textarea
                  placeholder="Type your response..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                  >
                    Close Ticket
                  </Button>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={!responseContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Response'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
