"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, XCircle, Trash, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Notification } from "@/types";

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/user/notifications", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);

        // Mark all as read when viewed
        if (data.notifications && data.notifications.length > 0) {
          const unreadIds = data.notifications
            .filter((n: Notification) => !n.read)
            .map((n: Notification) => n.id);

          if (unreadIds.length > 0) {
            markAsRead(unreadIds);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load notifications");
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });

      // Update local state to mark these as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          ids.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      const notificationIds = notifications.map(n => n.id);
      const response = await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: notificationIds }),
        credentials: "include",
      });

      if (response.ok) {
        setNotifications([]);
        toast.success("All notifications cleared.");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to clear notifications");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
        credentials: "include",
      });

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== id));
        toast.success("Notification removed.");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to remove notification");
      }
    } catch (error) {
      console.error("Error removing notification:", error);
      toast.error("Failed to remove notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ad":
        return <CheckCircle size={20} className="text-green-600" />;
      case "promotion":
        return <Clock size={20} className="text-yellow-600" />;
      case "payment":
        return <CheckCircle size={20} className="text-blue-600" />;
      case "payment-failed":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between p-3 border rounded-md ${notification.read ? "bg-gray-50" : "bg-green-50 border-green-200"
                }`}
            >
              <div className="flex items-center gap-3">
                {getNotificationIcon(notification.type)}
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
