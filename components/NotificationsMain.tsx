"use client";

import React, { useEffect } from "react";
import { Bell, CheckCircle, Clock, XCircle, Trash, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Notification } from "@/types";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Button } from "@/components/ui/button";

export default function NotificationsCenter() {
  const {
    notifications,
    error,
    isLoading,
    isMarking,
    isDeleting,
    markAsRead,
    deleteNotifications,
    clearAll,
    refreshNotifications
  } = useNotifications();

  // Mark all unread notifications as read when component mounts
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unreadIds = notifications
        .filter((n: Notification) => !n.read)
        .map((n: Notification) => n.id);

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [notifications]);

  // Function to delete a single notification
  const deleteNotification = async (id: string) => {
    await deleteNotifications([id]);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNotifications()}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
          {notifications && notifications.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Trash size={16} className="mr-1" />}
              Clear All
            </Button>
          )}
        </div>
      </div>

      {isLoading && !notifications?.length ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error.message || "Failed to load notifications"}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNotifications()}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between p-3 border rounded-md ${
                notification.read ? "bg-gray-50" : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {getNotificationIcon(notification.type)}
                <div>
                  <p className="text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNotification(notification.id)}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-600 transition"
                aria-label="Delete notification"
              >
                <Trash size={18} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
