"use client";

import { useState } from "react";
import { Bell, CheckCircle, Clock, XCircle, Info, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { initialNotifications } from "@/constants";


export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared.");
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notification removed.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Bell size={24} className="text-green-600" /> Notifications Center
        </h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No new notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {notification.type === "ad" && <CheckCircle size={20} className="text-green-600" />}
                {notification.type === "promotion" && <Clock size={20} className="text-yellow-600" />}
                {notification.type === "payment" && <CheckCircle size={20} className="text-blue-600" />}
                {notification.type === "payment-failed" && <XCircle size={20} className="text-red-600" />}
                <div>
                  <p className="text-gray-800">{notification.message}</p>
                  <span className="text-gray-500 text-sm">{notification.time}</span>
                </div>
              </div>
              <button onClick={() => deleteNotification(notification.id)} className="text-gray-400 hover:text-red-500">
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
