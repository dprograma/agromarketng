import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Notification } from '@/types';

interface UseNotificationsOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  isMarking: boolean;
  isDeleting: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
  deleteNotifications: (ids: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<any>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    staleTime = 30000,
    gcTime = 5 * 60 * 1000,
    refetchOnWindowFocus = false,
    refetchOnMount = false,
  } = options;

  const [isMarking, setIsMarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    select: (data: Notification[]) => data.map(notification => ({
      ...notification,
      time: new Date(notification.createdAt).toLocaleString()
    })).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  });

  const markAsRead = async (ids: string[]) => {
    setIsMarking(true);
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      refetch();
    } finally {
      setIsMarking(false);
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    setIsDeleting(true);
    try {
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      refetch();
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAll = async () => {
    setIsDeleting(true);
    try {
      await fetch('/api/notifications/clear-all', {
        method: 'POST'
      });
      refetch();
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    notifications,
    isLoading,
    error,
    isMarking,
    isDeleting,
    markAsRead,
    deleteNotifications,
    clearAll,
    refreshNotifications: refetch
  };
}
