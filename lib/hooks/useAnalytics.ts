import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionWrapper';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define analytics data types
export interface AdPerformance {
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  engagementRate: string;
  adDetails: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    shares: number;
    engagementRate: number;
    status: string;
    featured: boolean;
    category: string;
    createdAt: string;
    image: string | null;
    location: string;
  }>;
  dailyData: {
    labels: string[];
    viewsData: number[];
    clicksData: number[];
    sharesData: number[];
  };
  categoryPerformance: Array<{
    category: string;
    views: number;
    clicks: number;
    shares: number;
    count: number;
    engagementRate: number;
  }>;
  performanceTrends: {
    views: { current: number; previous: number; change: number };
    clicks: { current: number; previous: number; change: number };
    shares: { current: number; previous: number; change: number };
  };
}

export interface FinancialData {
  subscriptionDetails: {
    name: string;
    cost: number;
    features: any[];
  };
  boostCosts: number;
  boostDetails: Array<{
    adId: string;
    adTitle: string;
    boostType: number;
    boostStartDate: string;
    boostEndDate: string;
    cost: number;
  }>;
  totalSpent: number;
  earnings: number;
  profit: number;
  roi: number;
  monthlySpending: {
    months: string[];
    spending: number[];
  };
}

export interface Demographics {
  topLocations: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  devices: Array<{
    device: string;
    percentage: number;
    count: number;
  }>;
  gender: Array<{
    gender: string;
    percentage: number;
    count: number;
  }>;
  ageGroups: Array<{
    group: string;
    percentage: number;
    count: number;
  }>;
  timeOfDay: Array<{
    time: string;
    percentage: number;
    count: number;
  }>;
  totalAudience: number;
}

export interface AnalyticsData {
  adPerformance: AdPerformance;
  financialData: FinancialData;
  demographics: Demographics;
}

interface UseAnalyticsProps {
  timeRange?: '7days' | '30days' | '90days';
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  setTimeRange: (range: '7days' | '30days' | '90days') => void;
}

// Client-side cache
const analyticsCache: Record<string, { data: AnalyticsData; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useAnalytics({ timeRange = '30days' }: UseAnalyticsProps = {}): UseAnalyticsReturn {
  const { session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [currentTimeRange, setCurrentTimeRange] = useState<'7days' | '30days' | '90days'>(timeRange);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!session?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check client-side cache first
      const cacheKey = `${session.id}:${currentTimeRange}`;
      const cachedData = analyticsCache[cacheKey];

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        setData(cachedData.data);
        setIsLoading(false);
        return;
      }

      // Fetch from API if not in cache or cache expired
      const response = await fetch(`/api/user/analytics?timeRange=${currentTimeRange}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }

      const analyticsData = await response.json();

      // Update state
      setData(analyticsData);

      // Update client-side cache
      analyticsCache[cacheKey] = {
        data: analyticsData,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    if (session?.id) {
      fetchAnalyticsData();
    }
  }, [session?.id, currentTimeRange]);

  // Function to manually refresh data
  const refreshData = async () => {
    await fetchAnalyticsData();
  };

  // Function to change time range
  const setTimeRange = (range: '7days' | '30days' | '90days') => {
    setCurrentTimeRange(range);
  };

  return {
    data,
    isLoading,
    error,
    refreshData,
    setTimeRange
  };
}

// Function to track ad analytics events
export function trackAdAnalytics(adId: string, type: 'views' | 'clicks' | 'shares'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Send analytics event to API
      fetch(`/api/ads/${adId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type }),
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to track analytics event');
          }
          resolve();
        })
        .catch(error => {
          console.error(`Error tracking ${type} for ad ${adId}:`, error);
          reject(error);
        });
    } catch (error) {
      console.error(`Error tracking ${type} for ad ${adId}:`, error);
      reject(error);
    }
  });
}

interface Analytics {
  views: number;
  clicks: number;
  shares: number;
}

export function useAnalytics(adId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['analytics', adId];

  const { data: analytics = { views: 0, clicks: 0, shares: 0 } } = useQuery<Analytics>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/ads/${adId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const updateAnalytics = useMutation({
    mutationFn: async (type: 'views' | 'clicks' | 'shares') => {
      const response = await fetch(`/api/ads/${adId}/analytics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Failed to update analytics');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    analytics,
    updateAnalytics: updateAnalytics.mutate,
    isLoading: updateAnalytics.isPending,
  };
}
