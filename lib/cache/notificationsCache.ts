import { Notification } from '@/types';

// Cache keys
export const NOTIFICATIONS_CACHE_KEY = 'user-notifications';
export const UNREAD_COUNT_CACHE_KEY = 'unread-notifications-count';

// Cache expiration time (in milliseconds)
export const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Save notifications to localStorage with timestamp
 */
export function cacheNotifications(notifications: Notification[]): void {
  try {
    const cachedData: CachedData<Notification[]> = {
      data: notifications,
      timestamp: Date.now()
    };
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Error caching notifications:', error);
  }
}

/**
 * Get cached notifications from localStorage
 */
export function getCachedNotifications(): Notification[] | null {
  try {
    const cachedDataStr = localStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    if (!cachedDataStr) return null;

    const cachedData: CachedData<Notification[]> = JSON.parse(cachedDataStr);
    
    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
      return null;
    }
    
    return cachedData.data;
  } catch (error) {
    console.error('Error retrieving cached notifications:', error);
    return null;
  }
}

/**
 * Save unread count to localStorage with timestamp
 */
export function cacheUnreadCount(count: number): void {
  try {
    const cachedData: CachedData<number> = {
      data: count,
      timestamp: Date.now()
    };
    localStorage.setItem(UNREAD_COUNT_CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Error caching unread count:', error);
  }
}

/**
 * Get cached unread count from localStorage
 */
export function getCachedUnreadCount(): number | null {
  try {
    const cachedDataStr = localStorage.getItem(UNREAD_COUNT_CACHE_KEY);
    if (!cachedDataStr) return null;

    const cachedData: CachedData<number> = JSON.parse(cachedDataStr);
    
    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(UNREAD_COUNT_CACHE_KEY);
      return null;
    }
    
    return cachedData.data;
  } catch (error) {
    console.error('Error retrieving cached unread count:', error);
    return null;
  }
}

/**
 * Update cached notifications when marking as read
 */
export function updateCachedNotificationsAsRead(ids: string[]): void {
  try {
    const notifications = getCachedNotifications();
    if (!notifications) return;

    const updatedNotifications = notifications.map(notification => {
      if (ids.includes(notification.id)) {
        return { ...notification, read: true };
      }
      return notification;
    });

    cacheNotifications(updatedNotifications);
    
    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    cacheUnreadCount(unreadCount);
  } catch (error) {
    console.error('Error updating cached notifications:', error);
  }
}

/**
 * Remove notifications from cache
 */
export function removeCachedNotifications(ids: string[]): void {
  try {
    const notifications = getCachedNotifications();
    if (!notifications) return;

    const updatedNotifications = notifications.filter(
      notification => !ids.includes(notification.id)
    );

    cacheNotifications(updatedNotifications);
    
    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    cacheUnreadCount(unreadCount);
  } catch (error) {
    console.error('Error removing cached notifications:', error);
  }
}

/**
 * Clear all notification cache
 */
export function clearNotificationsCache(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    localStorage.removeItem(UNREAD_COUNT_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing notifications cache:', error);
  }
}
