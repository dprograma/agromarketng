"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { useSession } from "@/components/SessionWrapper";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Message, Chat, SupportChat } from "@/types";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSupportChat } from '@/lib/hooks/useSupportChat';


export default function Messages() {
  const searchParams = useSearchParams();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState("product-chats");

  // Product chats (user-to-user)
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Support chats (user-to-agent) - use hook instead of local state
  const [newSupportMessage, setNewSupportMessage] = useState("");

  // State for product chat message sending loading
  const [isSending, setIsSending] = useState(false);

  // Use loading state from the hook for support chats
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const scrollToSupportBottom = () => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize support chat hook
  const {
    supportChats, // Provided by hook
    activeChat: selectedSupportChat, // Provided by hook, mapped to component state name
    messages: supportMessages, // Provided by hook, mapped to component state name
    isLoading: isSupportLoading,
    isSending: isSupportSending,
    connectionState, // Can be used to show connection status if needed
    error: supportError,
    sendMessage: sendSupportMessageHook, // Provided by hook
    setActiveChat: setSelectedSupportChatHook, // Provided by hook, mapped to component state name
    createSupportChat: createNewSupportChat,
    refreshChats: refreshSupportChats
  } = useSupportChat({
    userId: session?.id || '', // Pass userId from session
    token: session?.token || '', // Pass token from session
    role: session?.role || 'user' // Pass role from session
  });

  // Effect to handle setting active tab based on search params and selecting chats
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    const chatId = searchParams.get('chatId');
    if (chatId) {
      // Check which tab is active to determine which chat list to search
      if (tab === 'product-chats') {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChat(chat);
        }
      } else if (tab === 'support-chats') {
        // Use the hook's function to set the active support chat
        setSelectedSupportChatHook(chatId);
      }
    }
  }, [searchParams, chats, supportChats, setSelectedSupportChatHook]); // Add supportChats and setSelectedSupportChatHook as dependencies

  // Effect to fetch all chats when session is available
  useEffect(() => {
    if (session) {
      // Only fetch product chats here, support chats are fetched by the hook
      fetchChats();
    }
  }, [session]);

  // Remove effects that fetch messages for selected chats - handled by hook/local fetch
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToSupportBottom();
  }, [supportMessages]);

  // Combine loading states if necessary for the overall component loading indicator
  const [isProductLoading, setIsProductLoading] = useState(true);
  const overallLoading = isProductLoading || isSupportLoading;

  const fetchAllChats = async () => {
    try {
      // Only fetch product chats here, support chats are fetched by the hook
      await fetchChats();

      // Support chats are loaded by the hook's internal logic
      // await fetchSupportChats(); // Remove this call
    } catch (error) {
      console.error('Error fetching all chats:', error);
    }
  };

  const fetchChats = async () => {
    setIsProductLoading(true);
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
    } finally {
      setIsProductLoading(false);
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    setIsSending(true);
    try {
      // Send message via API
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to send message');
      const sentMessage: Message = await response.json();

      // Add the new message to the state
      setMessages(prev => [...prev, sentMessage]);

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
    if (!selectedSupportChat || !newSupportMessage.trim() || isSupportSending) return;

    await sendSupportMessageHook(selectedSupportChat.id, newSupportMessage);
    setNewSupportMessage("");
  };

  // Add a function to create a new support chat if needed in the UI
  const handleCreateSupportChat = async (subject: string, initialMessage: string) => {
    const newChat = await createNewSupportChat(subject, initialMessage);
    if (newChat) {
      // Optionally set the new chat as active
      setSelectedSupportChatHook(newChat.id);
      setActiveTab('support-chats'); // Switch to support chats tab
    }
  };

  // JSX Structure - Update to use hook data
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product-chats">Product Chats</TabsTrigger>
            <TabsTrigger value="support-chats">Support Chats ({supportChats.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="product-chats" className="h-[calc(100vh-200px)] overflow-y-auto">
            {/* Product Chat List - Keep existing logic */}
            {overallLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p>No product chats yet.</p>
              </div>
            ) : (
              <ul>
                {chats.map(chat => (
                  <li
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    {/* Display Product Chat Info */}
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        {chat.ad.images && chat.ad.images[0] ? (
                          <Image src={chat.ad.images[0]} alt={chat.ad.title} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold truncate">{chat.ad.title}</p>
                        {/* Display last message if available */}
                        {chat.messages && chat.messages.length > 0 && (
                          <p className="text-sm text-gray-600 truncate">{chat.messages[chat.messages.length - 1].content}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {/* Display time since last message if available */}
                        {chat.messages && chat.messages.length > 0 && formatDistanceToNow(new Date(chat.messages[chat.messages.length - 1].createdAt), { addSuffix: true })}
                      </div>
                      {/* Display unread count */}
                      {(chat.participants?.find(p => p.user.id === session?.id)?.unreadCount ?? 0) > 0 && (
                        <Badge variant="destructive">{chat.participants.find(p => p.user.id === session?.id)?.unreadCount}</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="support-chats" className="h-[calc(100vh-200px)] overflow-y-auto">
            {/* Support Chat List - Use hook data */}
            {isSupportLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : supportChats.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full space-y-4">
                <p>No support chats yet.</p>
                {/* Optional: Add a button to create a new support chat */}
                <Button onClick={() => handleCreateSupportChat('General Inquiry', 'I need help with...')}>Create Support Chat</Button>
              </div>
            ) : (
              <ul>
                {supportChats.map(chat => (
                  <li
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSupportChat?.id === chat.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedSupportChatHook(chat.id)} // Use hook's setter
                  >
                    {/* Display Support Chat Info */}
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Support Chat: {chat.ticketId}</p>
                        {/* Display last message if available */}
                        {supportMessages.length > 0 && supportMessages[supportMessages.length - 1].chatId === chat.id && (
                          <p className="text-sm text-gray-600 truncate">{supportMessages[supportMessages.length - 1].content}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {/* Display time since last message if available */}
                        {supportMessages.length > 0 && supportMessages[supportMessages.length - 1].chatId === chat.id && formatDistanceToNow(new Date(supportMessages[supportMessages.length - 1].createdAt), { addSuffix: true })}
                      </div>
                      {/* Add unread count if available in SupportChat type */}
                      {/* chat.unreadCount > 0 && (<Badge variant="destructive">{chat.unreadCount}</Badge>) */}
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
        {activeTab === "product-chats" && selectedChat && (
          <div className="flex-1 flex flex-col">
            {/* Product Chat Header */}
            <div className="border-b p-4 flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {selectedChat.ad.images && selectedChat.ad.images[0] ? (
                  <Image src={selectedChat.ad.images[0]} alt={selectedChat.ad.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold">{selectedChat.ad.title}</h3>
            </div>

            {/* Product Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.senderId === session?.id ? 'text-right' : 'text-left'}`}
                >
                  <span className={`inline-block p-2 rounded-lg ${message.senderId === session?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
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
        )}

        {activeTab === "support-chats" && selectedSupportChat && (
          <div className="flex-1 flex flex-col">
            {/* Support Chat Header */}
            <div className="border-b p-4 flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold">Support Chat: {selectedSupportChat.ticketId}</h3>
              {/* Display status if available in SupportChat type */}
              {selectedSupportChat.status && (<Badge>{selectedSupportChat.status}</Badge>)}
            </div>

            {/* Support Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {supportMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.senderId === session?.id ? 'text-right' : 'text-left'}`}
                >
                  <span className={`inline-block p-2 rounded-lg ${message.senderId === session?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
              <div ref={supportMessagesEndRef} />
            </div>

            {/* Support Message Input */}
            <div className="border-t p-4">
              <form onSubmit={sendSupportMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a support message..."
                  value={newSupportMessage}
                  onChange={(e) => setNewSupportMessage(e.target.value)}
                  disabled={isSupportSending || selectedSupportChat.status === 'closed'}
                />
                <Button type="submit" disabled={isSupportSending || !newSupportMessage.trim() || selectedSupportChat.status === 'closed'}>
                  {isSupportSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              {selectedSupportChat.status === 'closed' && (
                <p className="text-xs text-center mt-2 text-red-500">
                  This support chat is closed. You cannot send messages.
                </p>
              )}
            </div>
          </div>
        )}

        {!selectedChat && !selectedSupportChat && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a chat to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}