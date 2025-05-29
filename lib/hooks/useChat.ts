import { useState, useEffect, useCallback } from 'react';
import { Message, Chat } from '@/types';
import { SocketManager, ConnectionState } from '../socket/socketManager';
import {
  cacheMessages,
  getCachedMessages,
  cacheChats,
  getCachedChats,
  storePendingMessage
} from '../cache/chatCache';
import toast from 'react-hot-toast';

interface UseChatProps {
  userId: string;
  token: string;
}

interface UseChatReturn {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  connectionState: ConnectionState;
  error: Error | null;
  sendMessage: (chatId: string, content: string, recipientId: string) => Promise<void>;
  setActiveChat: (chatId: string) => Promise<void>;
  createChat: (adId: string, recipientId: string, initialMessage: string) => Promise<Chat | null>;
  refreshChats: () => Promise<void>;
}

export function useChat({ userId, token }: UseChatProps): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);

  // Initialize socket manager
  useEffect(() => {
    if (userId && token) {
      const socketManager = SocketManager.getInstance();

      // Initialize socket connection
      socketManager.init(token, 'user', userId);

      // Listen for connection state changes
      socketManager.on('connectionStateChanged', (state: ConnectionState) => {
        setConnectionState(state);

        if (state === ConnectionState.CONNECTED) {
          toast.success('Connected to chat server');
        } else if (state === ConnectionState.DISCONNECTED || state === ConnectionState.ERROR) {
          toast.error('Disconnected from chat server. Reconnecting...');
        }
      });

      // Clean up on unmount
      return () => {
        socketManager.off('connectionStateChanged', setConnectionState);
      };
    }
  }, [userId, token]);

  // Load chats from cache and then fetch from API
  useEffect(() => {
    const loadChats = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // First load from cache
        const cachedChats = await getCachedChats();
        if (cachedChats.length > 0) {
          setChats(cachedChats);
          setIsLoading(false);
        }

        // Then fetch from API
        const response = await fetch('/api/chats', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }

        const data = await response.json();
        const fetchedChats = data.chats || [];

        // Update state with fresh data
        setChats(fetchedChats);

        // Cache the fetched chats
        await cacheChats(fetchedChats);
      } catch (err) {
        console.error('Error loading chats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading chats'));

        // If API fetch fails but we have cached data, keep using that
        const cachedChats = await getCachedChats();
        if (cachedChats.length > 0 && chats.length === 0) {
          setChats(cachedChats);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [userId]);

  // Listen for new messages
  useEffect(() => {
    if (!userId || !token) return;

    const socketManager = SocketManager.getInstance();

    // Handle incoming messages
    const handleNewMessage = (newMessage: Message) => {
      // Update messages if this is for the active chat
      if (activeChat && newMessage.chatId === activeChat.id) {
        setMessages(prev => [...prev, newMessage]);

        // Cache the updated messages
        cacheMessages(newMessage.chatId, [...messages, newMessage]);
      }

      // Update the chat in the chats list
      setChats(prev => prev.map(chat => {
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

    socketManager.on('message_received', handleNewMessage);

    return () => {
      socketManager.off('message_received', handleNewMessage);
    };
  }, [userId, token, activeChat, messages]);

  // Set active chat and load messages
  const setActiveChat = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Find the chat in our list
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setActiveChatState(chat);
      }

      // First load from cache
      const cachedMessages = await getCachedMessages(chatId);
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setIsLoading(false);
      }

      // Then fetch from API
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const fetchedMessages = data.messages || [];

      // Update state with fresh data
      setMessages(fetchedMessages);

      // Cache the fetched messages
      await cacheMessages(chatId, fetchedMessages);

      // Join the chat room via socket
      const socketManager = SocketManager.getInstance();
      socketManager.emit('join_chat', chatId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading messages'));

      // If API fetch fails but we have cached data, keep using that
      const cachedMessages = await getCachedMessages(chatId);
      if (cachedMessages.length > 0 && messages.length === 0) {
        setMessages(cachedMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [chats, messages]);

  // Send a message
  const sendMessage = useCallback(async (chatId: string, content: string, recipientId: string) => {
    if (!content.trim()) return;

    setIsSending(true);

    try {
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        chatId,
        senderId: userId,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: userId,
          name: 'You',
          image: null
        },
        pending: true
      };

      // Update UI optimistically
      setMessages(prev => [...prev, optimisticMessage]);

      // Check if socket is connected
      const socketManager = SocketManager.getInstance();
      const isConnected = socketManager.getConnectionState() === ConnectionState.CONNECTED;

      if (isConnected) {
        // Send via socket
        socketManager.emit('new_message', {
          chatId,
          content,
          recipientId
        });
      } else {
        // Store as pending message
        await storePendingMessage(chatId, content, 'regular');
        toast('Message will be sent when connection is restored');
      }

      // Also send via API for redundancy
      const response = await fetch(`/api/chats/${chatId}/messages`, {
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
      setChats(prev => prev.map(chat => {
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
      await cacheMessages(chatId, updatedMessages);

      // Cache the updated chats
      await cacheChats(chats);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      toast.error('Failed to send message. Please try again.');

      // Remove the optimistic message
      setMessages(prev => prev.filter(msg => !msg.pending));
    } finally {
      setIsSending(false);
    }
  }, [userId, messages, chats]);

  // Create a new chat
  const createChat = useCallback(async (adId: string, recipientId: string, initialMessage: string): Promise<Chat | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adId,
          recipientId,
          message: initialMessage
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data = await response.json();
      const newChat = data.chat;

      // Update chats list
      setChats(prev => [newChat, ...prev]);

      // Cache the updated chats
      await cacheChats([newChat, ...chats]);

      return newChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err instanceof Error ? err : new Error('Failed to create chat'));
      toast.error('Failed to create chat. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [chats]);

  // Refresh chats
  const refreshChats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      const fetchedChats = data.chats || [];

      // Update state with fresh data
      setChats(fetchedChats);

      // Cache the fetched chats
      await cacheChats(fetchedChats);
    } catch (err) {
      console.error('Error refreshing chats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error refreshing chats'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    chats,
    activeChat,
    messages,
    isLoading,
    isSending,
    connectionState,
    error,
    sendMessage,
    setActiveChat,
    createChat,
    refreshChats
  };
}
