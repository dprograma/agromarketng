import { io, Socket } from 'socket.io-client';
import { getPendingMessages, removePendingMessage, updatePendingMessageRetry } from '../cache/chatCache';

// Maximum number of retry attempts for sending pending messages
const MAX_RETRY_ATTEMPTS = 5;

// Socket connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Socket manager class
export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private token: string | null = null;
  private role: string | null = null;
  private userId: string | null = null;
  private pendingMessageProcessor: NodeJS.Timeout | null = null;

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Initialize socket connection
  public init(token: string, role: string = 'user', userId: string): void {
    this.token = token;
    this.role = role;
    this.userId = userId;

    if (this.socket) {
      this.disconnect();
    }

    this.connect();
    this.startPendingMessageProcessor();
  }

  // Connect to socket server
  private connect(): void {
    if (this.connectionState === ConnectionState.CONNECTING || 
        this.connectionState === ConnectionState.CONNECTED) {
      return;
    }

    this.connectionState = ConnectionState.CONNECTING;
    this.notifyListeners('connectionStateChanged', this.connectionState);

    try {
      this.socket = io(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin, {
        path: '/api/socketio',
        auth: {
          token: this.token,
          role: this.role,
          userId: this.userId
        },
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      // Connection events
      this.socket.on('connect', this.handleConnect.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));
      this.socket.on('connect_error', this.handleError.bind(this));
      this.socket.on('reconnect_attempt', this.handleReconnectAttempt.bind(this));
      this.socket.on('reconnect', this.handleReconnect.bind(this));
      this.socket.on('reconnect_error', this.handleReconnectError.bind(this));
      this.socket.on('reconnect_failed', this.handleReconnectFailed.bind(this));
    } catch (error) {
      console.error('Error initializing socket:', error);
      this.connectionState = ConnectionState.ERROR;
      this.notifyListeners('connectionStateChanged', this.connectionState);
      this.scheduleReconnect();
    }
  }

  // Handle successful connection
  private handleConnect(): void {
    console.log('SocketManager: Socket connected');
    this.reconnectAttempts = 0;
    this.connectionState = ConnectionState.CONNECTED;
    this.notifyListeners('connectionStateChanged', this.connectionState);
    
    // Process any pending messages
    this.processPendingMessages();
  }

  // Handle disconnection
  private handleDisconnect(reason: string): void {
    console.log(`SocketManager: Socket disconnected: ${reason}`);
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyListeners('connectionStateChanged', this.connectionState);
    
    // If not closed by client, try to reconnect
    if (reason !== 'io client disconnect') {
      this.scheduleReconnect();
    }
  }

  // Handle connection error
  private handleError(error: Error): void {
    console.error('SocketManager: Socket connection error:', error);
    this.connectionState = ConnectionState.ERROR;
    this.notifyListeners('connectionStateChanged', this.connectionState);
    this.scheduleReconnect();
  }

  // Handle reconnection attempt
  private handleReconnectAttempt(attempt: number): void {
    console.log(`SocketManager: Socket reconnection attempt ${attempt}`);
    this.reconnectAttempts = attempt;
    this.connectionState = ConnectionState.RECONNECTING;
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  // Handle successful reconnection
  private handleReconnect(attempt: number): void {
    console.log(`SocketManager: Socket reconnected after ${attempt} attempts`);
    this.reconnectAttempts = 0;
    this.connectionState = ConnectionState.CONNECTED;
    this.notifyListeners('connectionStateChanged', this.connectionState);
    
    // Process any pending messages
    this.processPendingMessages();
  }

  // Handle reconnection error
  private handleReconnectError(error: Error): void {
    console.error('SocketManager: Socket reconnection error:', error);
    this.connectionState = ConnectionState.ERROR;
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  // Handle reconnection failure
  private handleReconnectFailed(): void {
    console.error('SocketManager: Socket reconnection failed after maximum attempts');
    this.connectionState = ConnectionState.ERROR;
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  // Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.pendingMessageProcessor) {
      clearInterval(this.pendingMessageProcessor);
      this.pendingMessageProcessor = null;
    }
    
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  // Get current connection state
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Add event listener
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
    
    // If this is a socket event and socket exists, register the callback
    if (this.socket && event !== 'connectionStateChanged') {
      this.socket.on(event, (...args: any[]) => callback(...args));
    }
  }

  // Remove event listener
  public off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.delete(callback);
    }
    
    // If this is a socket event and socket exists, remove the callback
    if (this.socket && event !== 'connectionStateChanged') {
      this.socket.off(event, callback as any);
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, ...args: any[]): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Emit event to server
  public emit(event: string, ...args: any[]): void {
    if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`Cannot emit ${event}: Socket not connected`);
    }
  }

  // Start the pending message processor
  private startPendingMessageProcessor(): void {
    if (this.pendingMessageProcessor) {
      clearInterval(this.pendingMessageProcessor);
    }
    
    // Check for pending messages every 30 seconds
    this.pendingMessageProcessor = setInterval(() => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.processPendingMessages();
      }
    }, 30000);
  }

  // Process pending messages
  private async processPendingMessages(): Promise<void> {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      return;
    }
    
    try {
      const pendingMessages = await getPendingMessages();
      
      for (const message of pendingMessages) {
        // Skip messages that have exceeded retry attempts
        if (message.retryCount >= MAX_RETRY_ATTEMPTS) {
          console.warn(`Message ${message.id} exceeded max retry attempts, removing`);
          await removePendingMessage(message.id);
          continue;
        }
        
        try {
          if (message.type === 'regular') {
            // Emit regular chat message
            this.socket?.emit('new_message', {
              chatId: message.chatId,
              content: message.content,
              pendingId: message.id
            });
          } else {
            // Emit support chat message
            this.socket?.emit('new_support_message', {
              chatId: message.chatId,
              content: message.content,
              pendingId: message.id
            });
          }
          
          // Remove the message if it was sent successfully
          await removePendingMessage(message.id);
        } catch (error) {
          console.error(`Error sending pending message ${message.id}:`, error);
          await updatePendingMessageRetry(message.id);
        }
      }
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  }
}
