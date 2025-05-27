import redis from './redisClient';

// Cache keys
const USER_ANALYTICS_KEY = 'user-analytics:';
const AGENT_ANALYTICS_KEY = 'agent-analytics:';
const ADMIN_ANALYTICS_KEY = 'admin-analytics:';
const LANDING_ANALYTICS_KEY = 'landing-analytics';

// Cache expiration times (in seconds)
const USER_CACHE_TTL = 60 * 30; // 30 minutes
const AGENT_CACHE_TTL = 60 * 15; // 15 minutes
const ADMIN_CACHE_TTL = 60 * 10; // 10 minutes
const LANDING_CACHE_TTL = 60 * 60; // 1 hour

/**
 * Cache user analytics data
 */
export async function cacheUserAnalytics(userId: string, timeRange: string, data: any): Promise<void> {
  try {
    const key = `${USER_ANALYTICS_KEY}${userId}:${timeRange}`;
    await redis.set(key, JSON.stringify(data), { ex: USER_CACHE_TTL });
  } catch (error) {
    console.error('Error caching user analytics:', error);
  }
}

/**
 * Get cached user analytics data
 */
export async function getCachedUserAnalytics(userId: string, timeRange: string): Promise<any | null> {
  try {
    const key = `${USER_ANALYTICS_KEY}${userId}:${timeRange}`;
    const cachedData = await redis.get(key);
    
    if (!cachedData) return null;
    
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error('Error retrieving cached user analytics:', error);
    return null;
  }
}

/**
 * Invalidate user analytics cache
 */
export async function invalidateUserAnalyticsCache(userId: string): Promise<void> {
  try {
    const keys = await redis.keys(`${USER_ANALYTICS_KEY}${userId}:*`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating user analytics cache:', error);
  }
}

/**
 * Cache agent analytics data
 */
export async function cacheAgentAnalytics(agentId: string, timeRange: string, data: any): Promise<void> {
  try {
    const key = `${AGENT_ANALYTICS_KEY}${agentId}:${timeRange}`;
    await redis.set(key, JSON.stringify(data), { ex: AGENT_CACHE_TTL });
  } catch (error) {
    console.error('Error caching agent analytics:', error);
  }
}

/**
 * Get cached agent analytics data
 */
export async function getCachedAgentAnalytics(agentId: string, timeRange: string): Promise<any | null> {
  try {
    const key = `${AGENT_ANALYTICS_KEY}${agentId}:${timeRange}`;
    const cachedData = await redis.get(key);
    
    if (!cachedData) return null;
    
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error('Error retrieving cached agent analytics:', error);
    return null;
  }
}

/**
 * Invalidate agent analytics cache
 */
export async function invalidateAgentAnalyticsCache(agentId: string): Promise<void> {
  try {
    const keys = await redis.keys(`${AGENT_ANALYTICS_KEY}${agentId}:*`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating agent analytics cache:', error);
  }
}

/**
 * Cache admin analytics data
 */
export async function cacheAdminAnalytics(timeRange: string, data: any): Promise<void> {
  try {
    const key = `${ADMIN_ANALYTICS_KEY}${timeRange}`;
    await redis.set(key, JSON.stringify(data), { ex: ADMIN_CACHE_TTL });
  } catch (error) {
    console.error('Error caching admin analytics:', error);
  }
}

/**
 * Get cached admin analytics data
 */
export async function getCachedAdminAnalytics(timeRange: string): Promise<any | null> {
  try {
    const key = `${ADMIN_ANALYTICS_KEY}${timeRange}`;
    const cachedData = await redis.get(key);
    
    if (!cachedData) return null;
    
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error('Error retrieving cached admin analytics:', error);
    return null;
  }
}

/**
 * Invalidate admin analytics cache
 */
export async function invalidateAdminAnalyticsCache(): Promise<void> {
  try {
    const keys = await redis.keys(`${ADMIN_ANALYTICS_KEY}*`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating admin analytics cache:', error);
  }
}

/**
 * Cache landing page analytics data
 */
export async function cacheLandingAnalytics(data: any): Promise<void> {
  try {
    await redis.set(LANDING_ANALYTICS_KEY, JSON.stringify(data), { ex: LANDING_CACHE_TTL });
  } catch (error) {
    console.error('Error caching landing analytics:', error);
  }
}

/**
 * Get cached landing page analytics data
 */
export async function getCachedLandingAnalytics(): Promise<any | null> {
  try {
    const cachedData = await redis.get(LANDING_ANALYTICS_KEY);
    
    if (!cachedData) return null;
    
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error('Error retrieving cached landing analytics:', error);
    return null;
  }
}

/**
 * Invalidate landing page analytics cache
 */
export async function invalidateLandingAnalyticsCache(): Promise<void> {
  try {
    await redis.del(LANDING_ANALYTICS_KEY);
  } catch (error) {
    console.error('Error invalidating landing analytics cache:', error);
  }
}

/**
 * Invalidate all analytics caches
 */
export async function invalidateAllAnalyticsCache(): Promise<void> {
  try {
    const keys = await redis.keys('*-analytics:*');
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating all analytics cache:', error);
  }
}

/**
 * Increment ad analytics counter (views, clicks, shares)
 */
export async function incrementAdAnalytics(adId: string, type: 'views' | 'clicks' | 'shares'): Promise<void> {
  try {
    const key = `ad:${adId}:${type}`;
    await redis.incr(key);
    
    // Invalidate related caches
    await invalidateAllAnalyticsCache();
  } catch (error) {
    console.error(`Error incrementing ad ${type}:`, error);
  }
}

/**
 * Get ad analytics counters
 */
export async function getAdAnalytics(adId: string): Promise<{ views: number; clicks: number; shares: number }> {
  try {
    const [views, clicks, shares] = await Promise.all([
      redis.get(`ad:${adId}:views`),
      redis.get(`ad:${adId}:clicks`),
      redis.get(`ad:${adId}:shares`)
    ]);
    
    return {
      views: Number(views || 0),
      clicks: Number(clicks || 0),
      shares: Number(shares || 0)
    };
  } catch (error) {
    console.error('Error getting ad analytics:', error);
    return { views: 0, clicks: 0, shares: 0 };
  }
}
