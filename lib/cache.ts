type CacheEntry<T> = {
    data: T;
    timestamp: number;
};

export class Cache {
    private static instance: Cache;
    private cache: Map<string, CacheEntry<any>>;
    private readonly DEFAULT_TTL: number = 5 * 60 * 1000; // 5 minutes

    private constructor() {
        this.cache = new Map();
    }

    static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
        const entry = this.cache.get(key);
        const now = Date.now();
        const cacheTTL = ttl || this.DEFAULT_TTL;

        if (entry && now - entry.timestamp < cacheTTL) {
            return entry.data;
        }

        const data = await fetchFn();
        this.cache.set(key, { data, timestamp: now });
        return data;
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: string): void {
        this.cache.delete(key);
    }
}

export const cache = Cache.getInstance(); 