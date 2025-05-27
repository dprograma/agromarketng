import { openDB, IDBPDatabase } from 'idb';
import { Message, Chat, SupportChat, SupportMessage } from '@/types';

// Database name and version
const DB_NAME = 'chat-cache-db';
const DB_VERSION = 1;

// Store names
const MESSAGES_STORE = 'messages';
const CHATS_STORE = 'chats';
const SUPPORT_MESSAGES_STORE = 'support-messages';
const SUPPORT_CHATS_STORE = 'support-chats';
const PENDING_MESSAGES_STORE = 'pending-messages';

// Cache expiration time (in milliseconds)
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Interface for pending messages
interface PendingMessage {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  type: 'regular' | 'support';
  retryCount: number;
}

// Initialize the IndexedDB database
async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const messagesStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
        messagesStore.createIndex('chatId', 'chatId', { unique: false });
        messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(CHATS_STORE)) {
        const chatsStore = db.createObjectStore(CHATS_STORE, { keyPath: 'id' });
        chatsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(SUPPORT_MESSAGES_STORE)) {
        const supportMessagesStore = db.createObjectStore(SUPPORT_MESSAGES_STORE, { keyPath: 'id' });
        supportMessagesStore.createIndex('chatId', 'chatId', { unique: false });
        supportMessagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(SUPPORT_CHATS_STORE)) {
        const supportChatsStore = db.createObjectStore(SUPPORT_CHATS_STORE, { keyPath: 'id' });
        supportChatsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(PENDING_MESSAGES_STORE)) {
        const pendingMessagesStore = db.createObjectStore(PENDING_MESSAGES_STORE, { keyPath: 'id' });
        pendingMessagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        pendingMessagesStore.createIndex('retryCount', 'retryCount', { unique: false });
      }
    }
  });
}

// Cache regular chat messages
export async function cacheMessages(chatId: string, messages: Message[]): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(MESSAGES_STORE);

    // Add timestamp for cache expiration
    const timestamp = Date.now();

    for (const message of messages) {
      await store.put({
        ...message,
        chatId,
        timestamp
      });
    }

    await tx.done;
  } catch (error) {
    console.error('Error caching messages:', error);
  }
}

// Get cached messages for a chat
export async function getCachedMessages(chatId: string): Promise<Message[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(MESSAGES_STORE, 'readonly');
    const store = tx.objectStore(MESSAGES_STORE);
    const index = store.index('chatId');

    const messages = await index.getAll(chatId);
    const currentTime = Date.now();

    // Filter out expired messages
    const validMessages = messages.filter(message =>
      (currentTime - message.timestamp) < CACHE_EXPIRY
    );

    // Sort by createdAt
    return validMessages.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error retrieving cached messages:', error);
    return [];
  }
}

// Cache chats
export async function cacheChats(chats: Chat[]): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(CHATS_STORE, 'readwrite');
    const store = tx.objectStore(CHATS_STORE);

    for (const chat of chats) {
      await store.put({
        ...chat,
        timestamp: Date.now()
      });
    }

    await tx.done;
  } catch (error) {
    console.error('Error caching chats:', error);
  }
}

// Get all cached chats
export async function getCachedChats(): Promise<Chat[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(CHATS_STORE, 'readonly');
    const store = tx.objectStore(CHATS_STORE);

    const chats = await store.getAll();
    const currentTime = Date.now();

    // Filter out expired chats
    const validChats = chats.filter(chat =>
      (currentTime - chat.timestamp) < CACHE_EXPIRY
    );

    // Sort by updatedAt (most recent first)
    return validChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error retrieving cached chats:', error);
    return [];
  }
}

// Cache support chat messages
export async function cacheSupportMessages(chatId: string, messages: SupportMessage[]): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(SUPPORT_MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(SUPPORT_MESSAGES_STORE);

    const timestamp = Date.now();

    for (const message of messages) {
      await store.put({
        ...message,
        chatId,
        timestamp
      });
    }

    await tx.done;
  } catch (error) {
    console.error('Error caching support messages:', error);
  }
}

// Get cached support messages for a chat
export async function getCachedSupportMessages(chatId: string): Promise<SupportMessage[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(SUPPORT_MESSAGES_STORE, 'readonly');
    const store = tx.objectStore(SUPPORT_MESSAGES_STORE);
    const index = store.index('chatId');

    const messages = await index.getAll(chatId);
    const currentTime = Date.now();

    // Filter out expired messages
    const validMessages = messages.filter(message =>
      (currentTime - message.timestamp) < CACHE_EXPIRY
    );

    // Sort by createdAt
    return validMessages.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error retrieving cached support messages:', error);
    return [];
  }
}

// Cache support chats
export async function cacheSupportChats(chats: SupportChat[]): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(SUPPORT_CHATS_STORE, 'readwrite');
    const store = tx.objectStore(SUPPORT_CHATS_STORE);

    for (const chat of chats) {
      await store.put({
        ...chat,
        timestamp: Date.now()
      });
    }

    await tx.done;
  } catch (error) {
    console.error('Error caching support chats:', error);
  }
}

// Get all cached support chats
export async function getCachedSupportChats(): Promise<SupportChat[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(SUPPORT_CHATS_STORE, 'readonly');
    const store = tx.objectStore(SUPPORT_CHATS_STORE);

    const chats = await store.getAll();
    const currentTime = Date.now();

    // Filter out expired chats
    const validChats = chats.filter(chat =>
      (currentTime - chat.timestamp) < CACHE_EXPIRY
    );

    // Sort by updatedAt (most recent first)
    return validChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error retrieving cached support chats:', error);
    return [];
  }
}

// Store a pending message when offline
export async function storePendingMessage(
  chatId: string,
  content: string,
  type: 'regular' | 'support'
): Promise<string> {
  try {
    const db = await initDB();
    const tx = db.transaction(PENDING_MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_MESSAGES_STORE);

    const id = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const pendingMessage: PendingMessage = {
      id,
      chatId,
      content,
      timestamp: Date.now(),
      type,
      retryCount: 0
    };

    await store.add(pendingMessage);
    await tx.done;

    return id;
  } catch (error) {
    console.error('Error storing pending message:', error);
    throw error;
  }
}

// Get all pending messages
export async function getPendingMessages(): Promise<PendingMessage[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(PENDING_MESSAGES_STORE, 'readonly');
    const store = tx.objectStore(PENDING_MESSAGES_STORE);

    const pendingMessages = await store.getAll();

    // Sort by timestamp (oldest first to send in order)
    return pendingMessages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error retrieving pending messages:', error);
    return [];
  }
}

// Remove a pending message after it's sent successfully
export async function removePendingMessage(id: string): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(PENDING_MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_MESSAGES_STORE);

    await store.delete(id);
    await tx.done;
  } catch (error) {
    console.error('Error removing pending message:', error);
  }
}

// Update retry count for a pending message
export async function updatePendingMessageRetry(id: string): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(PENDING_MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_MESSAGES_STORE);

    const message = await store.get(id);
    if (message) {
      message.retryCount += 1;
      await store.put(message);
    }

    await tx.done;
  } catch (error) {
    console.error('Error updating pending message retry count:', error);
  }
}
