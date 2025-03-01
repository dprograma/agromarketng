"use client";

import React, { useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { faqData, helpTabs } from "@/constants";


export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState("faq");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [ticket, setTicket] = useState({ subject: "", message: "" });

  const handleSubmitTicket = () => {
    if (!ticket.subject || !ticket.message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Support ticket submitted successfully");
    setTicket({ subject: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📞 Support Center</h2>
      <p className="text-gray-600 text-center mt-2">Need help? Find answers or reach out to us.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {helpTabs.map(({ key, label, icon }) => (
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

      {/* FAQ Section */}
      {activeTab === "faq" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">📖 Frequently Asked Questions</h3>
          <div className="mt-4 space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border rounded-md p-3">
                <button
                  className="flex justify-between w-full text-left font-semibold text-gray-800"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.question}
                  <ChevronDown
                    className={cn("transition-transform", faqOpen === index && "rotate-180")}
                  />
                </button>
                {faqOpen === index && <p className="text-gray-600 mt-2">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Ticket Form */}
      {activeTab === "tickets" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">🎫 Submit a Support Ticket</h3>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Subject"
              value={ticket.subject}
              onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <textarea
              placeholder="Describe your issue..."
              value={ticket.message}
              onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-green-500 focus:border-green-500 mt-3"
              rows={4}
            />
            <button
              onClick={handleSubmitTicket}
              className="mt-2 bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* Live Chat */}
      {activeTab === "live-chat" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">💬 Live Chat</h3>
          <div className="mt-4 border rounded-md p-3 bg-gray-50 h-60 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-white p-2 rounded-md shadow-md">
                <p className="text-sm text-gray-700">👋 Hello! How can we help?</p>
              </div>
            </div>
            <div className="flex items-center border-t pt-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 border-none focus:ring-0"
              />
              <button className="ml-2 text-green-600">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
