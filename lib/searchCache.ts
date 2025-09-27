interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class SearchCache {
  private cache = new Map<string, CacheItem>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private popularTTL = 15 * 60 * 1000; // 15 minutes for popular searches
  private maxSize = 1000;
  private popularSearches = new Map<string, number>(); // track popularity

  constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private generateKey(params: Record<string, any>): string {
    // Create consistent cache key from search parameters
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .map(key => `${key}=${encodeURIComponent(params[key] || '')}`)
      .join('&');
  }

  private isPopular(key: string): boolean {
    const searchCount = this.popularSearches.get(key) || 0;
    return searchCount >= 3; // Consider popular after 3+ searches
  }

  get(searchParams: Record<string, any>): any | null {
    const key = this.generateKey(searchParams);
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Track popularity
    const currentCount = this.popularSearches.get(key) || 0;
    this.popularSearches.set(key, currentCount + 1);

    return item.data;
  }

  set(searchParams: Record<string, any>, data: any): void {
    const key = this.generateKey(searchParams);

    // Use longer TTL for popular searches
    const ttl = this.isPopular(key) ? this.popularTTL : this.defaultTTL;

    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    // Prevent cache from growing too large
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest non-popular entry
      this.evictOldest();
    }

    this.cache.set(key, item);
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime && !this.isPopular(key)) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Analytics methods
  getPopularSearches(limit = 10): Array<{query: string, count: number}> {
    return Array.from(this.popularSearches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({
        query: decodeURIComponent(query),
        count
      }));
  }

  getCacheStats(): {
    size: number;
    hitRate: number;
    popularSearchesCount: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for real implementation
      popularSearchesCount: this.popularSearches.size
    };
  }

  clear(): void {
    this.cache.clear();
    this.popularSearches.clear();
  }
}

// Export singleton instance
export const searchCache = new SearchCache();