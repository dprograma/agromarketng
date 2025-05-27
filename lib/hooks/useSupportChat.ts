import { useState, useEffect, useCallback } from 'react';
import { SupportChat, SupportMessage } from '@/types';
import { SocketManager, ConnectionState } from '../socket/socketManager';
import { 
  cacheSupportMessages, 
  getCachedSupportMessages, 
  cacheSupportChats, 
  getCachedSupportChats,
  storePendingMessage
} from '../cache/chatCache';
import toast from 'react-hot-toast';

interface UseSupportChatProps {
  userId: string;
  token: string;
  role?: 'user' | 'agent' | 'admin';
}

interface UseSupportChatReturn {
  supportChats: SupportChat[];
  activeChat: SupportChat | null;
  messages: SupportMessage[];
  isLoading: boolean;
  isSending: boolean;
  connectionState: ConnectionState;
  error: Error | null;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  setActiveChat: (chatId: string) => Promise<void>;
  createSupportChat: (subject: string, initialMessage: string) => Promise<SupportChat | null>;
  refreshChats: () => Promise<void>;
  markAsResolved: (chatId: string) => Promise<void>;
}

export function useSupportChat({ userId, token, role = 'user' }: UseSupportChatProps): UseSupportChatReturn {
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [activeChat, setActiveChatState] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);

  // Initialize socket manager
  useEffect(() => {
    if (userId && token) {
      const socketManager = SocketManager.getInstance();
      
      // Initialize socket connection
      socketManager.init(token, role, userId);
      
      // Listen for connection state changes
      socketManager.on('connectionStateChanged', (state: ConnectionState) => {
        setConnectionState(state);
        
        if (state === ConnectionState.CONNECTED) {
          toast.success('Connected to support chat server');
        } else if (state === ConnectionState.DISCONNECTED || state === ConnectionState.ERROR) {
          toast.error('Disconnected from support chat server. Reconnecting...');
        }
      });
      
      // Clean up on unmount
      return () => {
        socketManager.off('connectionStateChanged', setConnectionState);
      };
    }
  }, [userId, token, role]);

  // Load support chats from cache and then fetch from API
  useEffect(() => {
    const loadSupportChats = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First load from cache
        const cachedChats = await getCachedSupportChats();
        if (cachedChats.length > 0) {
          setSupportChats(cachedChats);
          setIsLoading(false);
        }
        
        // Then fetch from API
        const endpoint = role === 'agent' 
          ? '/api/agent/chats' 
          : role === 'admin' 
            ? '/api/admin/support-chats' 
            : '/api/user/support-chats';
            
        const response = await fetch(endpoint, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch support chats');
        }
        
        const data = await response.json();
        const fetchedChats = data.chats || [];
        
        // Update state with fresh data
        setSupportChats(fetchedChats);
        
        // Cache the fetched chats
        await cacheSupportChats(fetchedChats);
      } catch (err) {
        console.error('Error loading support chats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading support chats'));
        
        // If API fetch fails but we have cached data, keep using that
        const cachedChats = await getCachedSupportChats();
        if (cachedChats.length > 0 && supportChats.length === 0) {
          setSupportChats(cachedChats);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSupportChats();
  }, [userId, role]);

  // Listen for new support messages
  useEffect(() => {
    if (!userId || !token) return;
    
    const socketManager = SocketManager.getInstance();
    
    // Handle incoming messages
    const handleNewMessage = (newMessage: SupportMessage) => {
      // Update messages if this is for the active chat
      if (activeChat && newMessage.chatId === activeChat.id) {
        setMessages(prev => [...prev, newMessage]);
        
        // Cache the updated messages
        cacheSupportMessages(newMessage.chatId, [...messages, newMessage]);
      }
      
      // Update the chat in the chats list
      setSupportChats(prev => prev.map(chat => {
        if (chat.id === newMessage.chatId) {
          return {
            ...chat,
            lastMessage: newMessage,
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      }));
    };
    
    socketManager.on('support_message', handleNewMessage);
    
    return () => {
      socketManager.off('support_message', handleNewMessage);
    };
  }, [userId, token, activeChat, messages]);

  // Set active chat and load messages
  const setActiveChat = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the chat in our list
      const chat = supportChats.find(c => c.id === chatId);
      if (chat) {
        setActiveChatState(chat);
      }
      
      // First load from cache
      const cachedMessages = await getCachedSupportMessages(chatId);
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setIsLoading(false);
      }
      
      // Then fetch from API
      const endpoint = role === 'agent' 
        ? `/api/agent/chats/${chatId}/messages` 
        : role === 'admin' 
          ? `/api/admin/support-chats/${chatId}/messages` 
          : `/api/user/support-chats/${chatId}/messages`;
          
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch support messages');
      }
      
      const data = await response.json();
      const fetchedMessages = data.messages || [];
      
      // Update state with fresh data
      setMessages(fetchedMessages);
      
      // Cache the fetched messages
      await cacheSupportMessages(chatId, fetchedMessages);
      
      // Join the chat room via socket
      const socketManager = SocketManager.getInstance();
      socketManager.emit('join_support_chat', chatId);
    } catch (err) {
      console.error('Error loading support messages:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading support messages'));
      
      // If API fetch fails but we have cached data, keep using that
      const cachedMessages = await getCachedSupportMessages(chatId);
      if (cachedMessages.length > 0 && messages.length === 0) {
        setMessages(cachedMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supportChats, messages, role]);

  // Send a support message
  const sendMessage = useCallback(async (chatId: string, content: string) => {
    if (!content.trim()) return;
    
    setIsSending(true);
    
    try {
      // Create optimistic message
      const optimisticMessage: SupportMessage = {
        id: `temp-${Date.now()}`,
        content,
        chatId,
        sender: userId,
        senderType: role,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true
      };
      
      // Update UI optimistically
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Check if socket is connected
      const socketManager = SocketManager.getInstance();
      const isConnected = socketManager.getConnectionState() === ConnectionState.CONNECTED;
      
      if (isConnected) {
        // Send via socket
        socketManager.emit('new_support_message', {
          chatId,
          content
        });
      } else {
        // Store as pending message
        await storePendingMessage(chatId, content, 'support');
        toast.warning('Message will be sent when connection is restored');
      }
      
      // Also send via API for redundancy
      const endpoint = role === 'agent' 
        ? `/api/agent/chats/${chatId}/messages` 
        : role === 'admin' 
          ? `/api/admin/support-chats/${chatId}/messages` 
          : `/api/user/support-chats/${chatId}/messages`;
          
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? data.message : msg
      ));
      
      // Update chat in list
      setSupportChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: data.message,
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      }));
      
      // Cache the updated messages
      const updatedMessages = messages.filter(msg => msg.id !== optimisticMessage.id).concat(data.message);
      await cacheSupportMessages(chatId, updatedMessages);
      
      // Cache the updated chats
      await cacheSupportChats(supportChats);
    } catch (err) {
      console.error('Error sending support message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      toast.error('Failed to send message. Please try again.');
      
      // Remove the optimistic message
      setMessages(prev => prev.filter(msg => !msg.pending));
    } finally {
      setIsSending(false);
    }
  }, [userId, messages, supportChats, role]);

  // Create a new support chat
  const createSupportChat = useCallback(async (subject: string, initialMessage: string): Promise<SupportChat | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/support-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          message: initialMessage
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create support chat');
      }
      
      const data = await response.json();
      const newChat = data.chat;
      
      // Update chats list
      setSupportChats(prev => [newChat, ...prev]);
      
      // Cache the updated chats
      await cacheSupportChats([newChat, ...supportChats]);
      
      return newChat;
    } catch (err) {
      console.error('Error creating support chat:', err);
      setError(err instanceof Error ? err : new Error('Failed to create support chat'));
      toast.error('Failed to create support chat. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supportChats]);

  // Refresh support chats
  const refreshChats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = role === 'agent' 
        ? '/api/agent/chats' 
        : role === 'admin' 
          ? '/api/admin/support-chats' 
          : '/api/user/support-chats';
          
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch support chats');
      }
      
      const data = await response.json();
      const fetchedChats = data.chats || [];
      
      // Update state with fresh data
      setSupportChats(fetchedChats);
      
      // Cache the fetched chats
      await cacheSupportChats(fetchedChats);
    } catch (err) {
      console.error('Error refreshing support chats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error refreshing support chats'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]);

  // Mark a chat as resolved
  const markAsResolved = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = role === 'agent' 
        ? `/api/agent/chats/${chatId}/resolve` 
        : role === 'admin' 
          ? `/api/admin/support-chats/${chatId}/resolve` 
          : `/api/user/support-chats/${chatId}/resolve`;
          
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark chat as resolved');
      }
      
      // Update chat in list
      setSupportChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            status: 'resolved',
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      }));
      
      // If this is the active chat, update it
      if (activeChat && activeChat.id === chatId) {
        setActiveChatState({
          ...activeChat,
          status: 'resolved',
          updatedAt: new Date().toISOString()
        });
      }
      
      // Cache the updated chats
      await cacheSupportChats(supportChats);
      
      toast.success('Chat marked as resolved');
    } catch (err) {
      console.error('Error marking chat as resolved:', err);
      setError(err instanceof Error ? err : new Error('Failed to mark chat as resolved'));
      toast.error('Failed to mark chat as resolved. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [supportChats, activeChat, role]);

  return {
    supportChats,
    activeChat,
    messages,
    isLoading,
    isSending,
    connectionState,
    error,
    sendMessage,
    setActiveChat,
    createSupportChat,
    refreshChats,
    markAsResolved
  };
}
