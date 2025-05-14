"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LiveChatWindow from "./LiveChatWindow";

export default function LiveChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && <LiveChatWindow onClose={() => setIsOpen(false)} />}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all",
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Chat with us</span>
          </>
        )}
      </button>
    </div>
  );
}