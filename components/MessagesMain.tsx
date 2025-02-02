"use client";

import React,{ useState } from "react";
import { MessageSquare, Inbox, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { sampleMessages, MessagesTabs } from "@/constants";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📩 Messages & Inquiries</h2>
      <p className="text-gray-600 text-center mt-2">Communicate with buyers and sellers securely.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {MessagesTabs.map(({ key, label, icon }) => (
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
      </div>

      {/* Message List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 border-r pr-4">
          <h3 className="text-lg font-semibold text-gray-700">📥 {activeTab === "inbox" ? "Inbox" : "Spam Messages"}</h3>
          <div className="mt-4 space-y-4">
            {sampleMessages
              .filter((msg) => (activeTab === "spam" ? msg.isSpam : !msg.isSpam))
              .map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-center gap-4 p-3 border rounded-md cursor-pointer hover:bg-gray-100 transition",
                    selectedMessage?.id === msg.id ? "bg-green-100 border-green-500" : "bg-white"
                  )}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <img src={msg.senderAvatar} alt={msg.sender} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold">{msg.sender}</p>
                    <p className="text-sm text-gray-600">{msg.lastMessage}</p>
                    <p className="text-xs text-gray-400">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="col-span-2">
          {selectedMessage ? (
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold text-gray-700">💬 Conversation</h3>
              <p className="text-sm text-gray-500">Ad: {selectedMessage.adTitle}</p>
              <div className="mt-4 p-3 border rounded-md bg-gray-50">
                <p className="font-semibold">{selectedMessage.sender}</p>
                <p className="text-gray-700">{selectedMessage.lastMessage}</p>
                <p className="text-xs text-gray-400">{selectedMessage.timestamp}</p>
              </div>

              {/* Reply Box */}
              <div className="mt-4">
                <textarea
                  className="w-full p-3 border rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Type your reply..."
                ></textarea>
                <button className="mt-2 bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition">
                  Send Message
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <MessageSquare size={40} className="mr-2" />
              Select a message to view conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
