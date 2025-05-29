"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/SessionWrapper";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  failed?: boolean;
}

interface LiveChatWindowProps {
  onClose: () => void;
}

export default function LiveChatWindow({ onClose }: LiveChatWindowProps) {
  const { session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hello! How can I assist you today?",
      sender: "agent",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (session?.token) {
      try {
        const socketInstance = io({
          path: '/api/socketio',
          auth: {
            token: session.token
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        // Connection events
        socketInstance.on('connect', () => {
          console.log('Live Chat: Connected to WebSocket');
          // Join support room
          socketInstance.emit('join_support_chat', session.id);
        });

        // Message events
        socketInstance.on('support_message', (newMessage: Message) => {
          setMessages(prev => [...prev, newMessage]);
          setIsTyping(false);
        });

        socketInstance.on('agent_typing', () => {
          setIsTyping(true);
        });

        // Error handling
        socketInstance.on('connect_error', (error) => {
          console.error('Live Chat: Connection error', error);
          toast.error('Unable to connect to chat service. Please try again later.');
        });

        socketInstance.on('error', (error) => {
          console.error('Live Chat: Socket error', error);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Live Chat: Disconnected', reason);
          if (reason === 'io server disconnect') {
            // The disconnection was initiated by the server, try to reconnect
            socketInstance.connect();
          }
        });

        setSocket(socketInstance);

        return () => {
          try {
            socketInstance.emit('leave_support_chat', session.id);
            socketInstance.disconnect();
          } catch (error) {
            console.error('Error during socket cleanup:', error);
          }
        };
      } catch (error) {
        console.error('Error initializing socket connection:', error);
        toast.error('Failed to initialize chat. Please refresh the page.');
      }
    }
  }, [session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !socket) return;

    setIsSending(true);
    try {
      // Create message object
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };

      // Update UI immediately for better UX
      setMessages(prev => [...prev, userMessage]);
      setMessage("");

      // Emit message through socket with timeout handling
      const messageDelivered = await new Promise<boolean>((resolve) => {
        // Set a timeout for message delivery
        const timeoutId = setTimeout(() => {
          resolve(false); // Message delivery timed out
        }, 5000);

        // Emit the message
        socket.emit('support_message', {
          content: message,
          userId: session?.id
        }, () => {
          clearTimeout(timeoutId);
          resolve(true); // Message delivered successfully
        });
      });

      if (!messageDelivered) {
        // If message delivery timed out, show an error
        toast.error('Message delivery timed out. Please try again.');

        // Optionally, mark the message as failed in the UI
        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id
              ? { ...msg, failed: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-green-500 p-4">
        <h3 className="text-lg font-semibold text-white">Live Chat</h3>
        <p className="text-sm text-green-100">We typically reply in a few minutes</p>
      </div>

      <div className="h-96 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] mb-4",
                msg.sender === "user" ? "ml-auto" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-3",
                  msg.sender === "user"
                    ? msg.failed
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {msg.content}
                {msg.failed && (
                  <div className="text-xs text-red-600 mt-1 flex items-center">
                    <span>Failed to send</span>
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "text-xs mt-1",
                  msg.sender === "user" ? "text-right" : "text-left"
                )}
              >
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center text-gray-500 text-sm">
              <div className="dot-typing"></div>
              Agent is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={!session}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim() || !session}
              className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          {!session && (
            <p className="text-sm text-red-500 mt-2">
              Please sign in to start chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}