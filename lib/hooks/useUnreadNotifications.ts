import useSWR from 'swr';
import { 
  cacheUnreadCount, 
  getCachedUnreadCount, 
  UNREAD_COUNT_CACHE_KEY 
} from '../cache/notificationsCache';

// Fetcher function for SWR
const fetchUnreadCount = async (): Promise<number> => {
  const response = await fetch('/api/user/notifications/unread', {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch unread count');
  }

  const data = await response.json();
  
  // Cache the fetched count
  cacheUnreadCount(data.count || 0);
  
  return data.count || 0;
};

export function useUnreadNotifications() {
  // Use SWR for data fetching with stale-while-revalidate strategy
  const { data: unreadCount, error, isLoading, mutate: refreshUnreadCount } = useSWR<number>(
    UNREAD_COUNT_CACHE_KEY,
    fetchUnreadCount,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: getCachedUnreadCount() || 0, // Use cached data as fallback
      dedupingInterval: 5000, // Dedupe calls within 5 seconds
      onError: (err) => {
        console.error('Error fetching unread count:', err);
      }
    }
  );

  return {
    unreadCount: unreadCount || 0,
    error,
    isLoading,
    refreshUnreadCount
  };
}
