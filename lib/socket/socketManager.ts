// lib/socket/socketManager.ts
import { io, Socket } from 'socket.io-client';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface SocketManagerEvents {
  connectionStateChanged: (state: ConnectionState) => void;
  messageReceived: (data: any) => void;
  supportMessage: (data: any) => void;
  supportChatCreated: (data: any) => void;
  agentAccepted: (data: any) => void;
  supportChatClosed: (data: any) => void;
  notificationReceived: (data: any) => void;
  typingStarted: (data: any) => void;
  typingStopped: (data: any) => void;
  error: (data: any) => void;
}

class SocketManager {
  private static instance: SocketManager | null = null;
  private socket: Socket | null = null;
  private listeners: Map<keyof SocketManagerEvents, Set<Function>> = new Map();
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private token: string | null = null;
  private role: string | null = null;
  private userId: string | null = null;

  constructor() {
    // Initialize listener sets
    Object.keys({} as SocketManagerEvents).forEach(event => {
      this.listeners.set(event as keyof SocketManagerEvents, new Set());
    });
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Initialize the socket connection (alias for connect method)
  init(token: string, role: string, userId: string): Promise<void> {
    return this.connect(token, role, userId);
  }

  // Event listener management
  on<K extends keyof SocketManagerEvents>(event: K, callback: SocketManagerEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof SocketManagerEvents>(event: K, callback: SocketManagerEvents[K]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners<K extends keyof SocketManagerEvents>(
    event: K,
    ...args: Parameters<SocketManagerEvents[K]>
  ) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Connection management
  connect(token: string, role: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        resolve();
        return;
      }

      this.token = token;
      this.role = role;
      this.userId = userId;

      if (this.socket) {
        this.socket.disconnect();
      }

      this.connectionState = ConnectionState.CONNECTING;
      this.notifyListeners('connectionStateChanged', this.connectionState);

      try {
        // Connect to the standalone socket server
        const socketUrl = process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_BASE_URL?.replace('http', 'ws') || 'ws://localhost:3002'
          : `http://localhost:${process.env.SOCKET_PORT || 3002}`;

        console.log('Connecting to socket server:', socketUrl);

        this.socket = io(socketUrl, {
          auth: {
            token: this.token,
            role: this.role,
            userId: this.userId
          },
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          timeout: 10000,
          transports: ['websocket', 'polling'],
          forceNew: true,
          autoConnect: true
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.connectionState = ConnectionState.CONNECTED;
          this.reconnectAttempts = 0;
          this.notifyListeners('connectionStateChanged', this.connectionState);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.connectionState = ConnectionState.DISCONNECTED;
          this.notifyListeners('connectionStateChanged', this.connectionState);
          
          // Auto-reconnect for certain disconnect reasons
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            setTimeout(() => this.reconnect(), this.reconnectInterval);
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.connectionState = ConnectionState.ERROR;
          this.notifyListeners('connectionStateChanged', this.connectionState);
          reject(error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Socket reconnect attempt ${attemptNumber}`);
          this.connectionState = ConnectionState.RECONNECTING;
          this.notifyListeners('connectionStateChanged', this.connectionState);
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`);
          this.connectionState = ConnectionState.CONNECTED;
          this.reconnectAttempts = 0;
          this.notifyListeners('connectionStateChanged', this.connectionState);
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.connectionState = ConnectionState.ERROR;
            this.notifyListeners('connectionStateChanged', this.connectionState);
          }
        });

        // Application-specific events
        this.setupEventListeners();

      } catch (error) {
        console.error('Error creating socket connection:', error);
        this.connectionState = ConnectionState.ERROR;
        this.notifyListeners('connectionStateChanged', this.connectionState);
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Chat events
    this.socket.on('message_received', (data) => {
      this.notifyListeners('messageReceived', data);
    });

    this.socket.on('typing_started', (data) => {
      this.notifyListeners('typingStarted', data);
    });

    this.socket.on('typing_stopped', (data) => {
      this.notifyListeners('typingStopped', data);
    });

    // Support chat events
    this.socket.on('support_message', (data) => {
      this.notifyListeners('supportMessage', data);
    });

    this.socket.on('support_chat_created', (data) => {
      this.notifyListeners('supportChatCreated', data);
    });

    this.socket.on('agent_accepted', (data) => {
      this.notifyListeners('agentAccepted', data);
    });

    this.socket.on('support_chat_closed', (data) => {
      this.notifyListeners('supportChatClosed', data);
    });

    // Notification events
    this.socket.on('notification_received', (data) => {
      this.notifyListeners('notificationReceived', data);
    });

    // Error events
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.notifyListeners('error', data);
    });

    this.socket.on('no_agents_available', (data) => {
      console.log('No agents available:', data);
      this.notifyListeners('error', data);
    });
  }

  private reconnect() {
    if (this.token && this.role && this.userId) {
      console.log('Attempting to reconnect socket...');
      this.connect(this.token, this.role, this.userId).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  // Generic emit method
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`);
    }
  }

  // Chat methods
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  sendMessage(data: { chatId: string; message: any; recipientId: string }) {
    if (this.socket?.connected) {
      this.socket.emit('new_message', data);
    }
  }

  startTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_started', { chatId });
    }
  }

  stopTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stopped', { chatId });
    }
  }

  // Support chat methods
  joinSupportChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_support_chat', chatId);
    }
  }

  leaveSupportChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_support_chat', chatId);
    }
  }

  sendSupportMessage(data: any) {
    if (this.socket?.connected) {
      this.socket.emit('support_message', data);
    }
  }

  acceptSupportChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('accept_support_chat', { chatId });
    }
  }

  closeSupportChat(chatId: string, reason?: string) {
    if (this.socket?.connected) {
      this.socket.emit('close_support_chat', { chatId, reason });
    }
  }

  // Notification methods
  sendNotification(data: { userId: string; type: string; message: string; time?: string }) {
    if (this.socket?.connected) {
      this.socket.emit('send_notification', data);
    }
  }

  broadcastNotification(data: { type: string; message: string; userIds?: string[] }) {
    if (this.socket?.connected) {
      this.socket.emit('broadcast_notification', data);
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  get getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance and class
export { SocketManager };
export const socketManager = new SocketManager();
export default socketManager;