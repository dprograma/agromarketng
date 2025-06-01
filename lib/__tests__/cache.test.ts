import { Cache, cache } from '../cache'; // Import both the class and the instance

// Mock the Date.now function to control time for TTL tests
const mockDateNow = jest.spyOn(Date, 'now');

describe('Cache', () => {
    // Type the variable with the Cache interface
    let cacheInstance: Cache;

    beforeEach(() => {
        // Reset the singleton instance before each test by manipulating the static property
        (Cache as any).instance = undefined; // Cast Cache to any to access private static instance
        // Get a new instance using the static method from the imported Cache class
        cacheInstance = Cache.getInstance();
        mockDateNow.mockReturnValue(0); // Start time at 0
    });

    afterEach(() => {
        mockDateNow.mockRestore();
        // Clean up the cache instance after each test
        cacheInstance.clear();
    });

    it('should return the same instance (singleton)', () => {
        // Verify that calling getInstance on the Cache class returns the same instance
        const cache2 = Cache.getInstance();
        expect(cacheInstance).toBe(cache2);
    });

    describe('getOrSet', () => {
        it('should fetch and cache data if key does not exist', async () => {
            const fetchFn = jest.fn().mockResolvedValue('initial data');
            const key = 'testKey';

            // Use the instance variable
            const data = await cacheInstance.getOrSet(key, fetchFn);

            expect(data).toBe('initial data');
            expect(fetchFn).toHaveBeenCalledTimes(1);
        });

        it('should return cached data if key exists and is not expired', async () => {
            const fetchFn = jest.fn().mockResolvedValue('initial data');
            const key = 'testKey';

            // First call to cache the data using the instance variable
            await cacheInstance.getOrSet(key, fetchFn, 1000); // TTL of 1000ms

            // Advance time, but within TTL
            mockDateNow.mockReturnValue(500);

            // Second call using the instance variable
            const data = await cacheInstance.getOrSet(key, fetchFn, 1000); // Provide TTL again

            expect(data).toBe('initial data');
            expect(fetchFn).toHaveBeenCalledTimes(1); // fetchFn should not be called again
        });

        it('should refetch and cache data if key exists but is expired', async () => {
            const fetchFn = jest.fn()
                .mockResolvedValueOnce('initial data')
                .mockResolvedValueOnce('new data');
            const key = 'testKey';

            // First call to cache the data using the instance variable
            await cacheInstance.getOrSet(key, fetchFn, 1000); // TTL of 1000ms

            // Advance time beyond TTL
            mockDateNow.mockReturnValue(1001);

            // Second call using the instance variable, provide TTL again
            const data = await cacheInstance.getOrSet(key, fetchFn, 1000);

            expect(data).toBe('new data');
            expect(fetchFn).toHaveBeenCalledTimes(2); // fetchFn should be called again
        });

        it('should handle fetch function throwing an error', async () => {
            const fetchFn = jest.fn().mockRejectedValue(new Error('Fetch failed'));
            const key = 'testKey';

            // Use the instance variable
            await expect(cacheInstance.getOrSet(key, fetchFn)).rejects.toThrow('Fetch failed');
            expect(fetchFn).toHaveBeenCalledTimes(1);
        });

        it('should use default TTL if not provided', async () => {
            // This test is more conceptual as default TTL is internal.
            // We test by ensuring it behaves like a cache with some expiry.
            const fetchFn = jest.fn()
                .mockResolvedValueOnce('initial data')
                .mockResolvedValueOnce('new data');
            const key = 'testKey';
            const defaultTTL = 5 * 60 * 1000; // Assuming default TTL is 5 minutes

            // First call using the instance variable
            await cacheInstance.getOrSet(key, fetchFn);

            // Advance time beyond the assumed default TTL
            mockDateNow.mockReturnValue(defaultTTL + 1);

            // Second call using the instance variable, should use default TTL
            const data = await cacheInstance.getOrSet(key, fetchFn);

            expect(data).toBe('new data');
            expect(fetchFn).toHaveBeenCalledTimes(2);
        });
    });

    describe('clear', () => {
        it('should clear the cache', async () => {
            const fetchFn = jest.fn().mockResolvedValue('initial data');
            const key = 'testKey';

            await cacheInstance.getOrSet(key, fetchFn);
            expect(fetchFn).toHaveBeenCalledTimes(1);

            cacheInstance.clear();

            // Fetch again, should call fetchFn as cache is cleared
            await cacheInstance.getOrSet(key, fetchFn);
            expect(fetchFn).toHaveBeenCalledTimes(2);
        });
    });

    describe('delete', () => {
        it('should delete a specific key from the cache', async () => {
            const fetchFn1 = jest.fn().mockResolvedValue('data1');
            const fetchFn2 = jest.fn().mockResolvedValue('data2');
            const key1 = 'key1';
            const key2 = 'key2';

            await cacheInstance.getOrSet(key1, fetchFn1);
            await cacheInstance.getOrSet(key2, fetchFn2);
            expect(fetchFn1).toHaveBeenCalledTimes(1);
            expect(fetchFn2).toHaveBeenCalledTimes(1);

            cacheInstance.delete(key1);

            // Fetch key1 again, should call fetchFn1 as it was deleted
            await cacheInstance.getOrSet(key1, fetchFn1);
            expect(fetchFn1).toHaveBeenCalledTimes(2);

            // Fetch key2 again, should return cached data as it was not deleted
            await cacheInstance.getOrSet(key2, fetchFn2);
            expect(fetchFn2).toHaveBeenCalledTimes(1);
        });
    });
});
