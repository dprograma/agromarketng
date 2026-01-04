import {
    fetchWithErrorHandling,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    apiPatch,
} from '../apiUtils';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any; // Cast to any to bypass TS errors for partial mock

describe('apiUtils', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        (toast.error as jest.Mock).mockClear();
        (toast.success as jest.Mock).mockClear();
        // Restore original fetch after each test to avoid interference (though reassignment might be enough)
        // global.fetch = originalFetch; // Assuming originalFetch was stored if needed
    });

    // No afterEach needed if beforeEach reassigns fetch

    describe('fetchWithErrorHandling', () => {
        it('should return data on successful fetch', async () => {
            const mockData = { success: true, data: { id: 1, name: 'Test' } };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
                headers: { // Added headers mock
                    get: jest.fn((headerName: string) => {
                        if (headerName.toLowerCase() === 'content-type') {
                            return 'application/json';
                        }
                        return null;
                    }),
                } as any, // Cast headers to any
            });

            const result = await fetchWithErrorHandling('/test-url');
            // Expect the full mockData object, not just the data field
            expect(result).toEqual(mockData);
            // Updated expected options to include default headers and credentials
            expect(mockFetch).toHaveBeenCalledWith('/test-url', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('should throw an error and show toast on non-ok response', async () => {
            const mockError = { success: false, message: 'Something went wrong' };
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => mockError,
                headers: { get: jest.fn() } as any,
                statusText: 'Bad Request', // Add statusText for non-JSON error
            });

            await expect(fetchWithErrorHandling('/test-url')).rejects.toThrow(
                'Something went wrong'
            );
            // Updated expected options to include default headers and credentials
            expect(mockFetch).toHaveBeenCalledWith('/test-url', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            expect(toast.error).toHaveBeenCalledWith('Something went wrong');
        });

        it('should throw a generic error and show toast if response is not JSON', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Not JSON'); },
                text: async () => 'Not JSON',
                headers: { get: jest.fn(() => null) } as any,
                statusText: 'Internal Server Error',
                status: 500,
            });

            await expect(fetchWithErrorHandling('/test-url')).rejects.toThrow(
                'Internal Server Error'
            );
            expect(mockFetch).toHaveBeenCalledWith('/test-url', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            expect(toast.error).toHaveBeenCalledWith('Internal Server Error');
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network request failed');
            mockFetch.mockRejectedValueOnce(networkError);

            await expect(fetchWithErrorHandling('/test-url')).rejects.toThrow(
                'Network request failed'
            );
            // Updated expected options to include default headers and credentials
            expect(mockFetch).toHaveBeenCalledWith('/test-url', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            expect(toast.error).toHaveBeenCalledWith('Network request failed');
        });

        it('should include options in fetch call', async () => {
            const mockData = { success: true, data: {} };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
                headers: { get: jest.fn() } as any,
            });
            const options = { method: 'POST', body: JSON.stringify({ key: 'value' }) };

            await fetchWithErrorHandling('/test-url', options);
            // Expect merged options with default headers and credentials
            expect(mockFetch).toHaveBeenCalledWith('/test-url', {
                ...options,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        });
    });

    describe('apiGet', () => {
        it('should call fetchWithErrorHandling with GET method', async () => {
            const mockData = { success: true, data: { id: 1 } };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
                headers: {
                    get: jest.fn((header) => {
                        if (header === 'content-type') return 'application/json';
                        return null;
                    })
                } as any,
            });

            const result = await apiGet('/test-url');
            expect(result).toEqual(mockData);
        });
    });

    describe('apiPost', () => {
        it('should call fetchWithErrorHandling with POST method and body', async () => {
            const mockData = { success: true, data: { id: 1 } }; // Simulate full response structure
            jest
                .spyOn(require('../apiUtils'), 'fetchWithErrorHandling')
                .mockResolvedValueOnce(mockData);
            const body = { name: 'New Item' };

            const result = await apiPost('/test-url', body);
            expect(result).toEqual(mockData); // Expect the full mockData object
            expect(fetchWithErrorHandling).toHaveBeenCalledWith('/test-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        });
    });

    describe('apiPut', () => {
        it('should call fetchWithErrorHandling with PUT method and body', async () => {
            const mockData = { success: true, data: { id: 1 } }; // Simulate full response structure
            jest
                .spyOn(require('../apiUtils'), 'fetchWithErrorHandling')
                .mockResolvedValueOnce(mockData);
            const body = { name: 'Updated Item' };

            const result = await apiPut('/test-url', body);
            expect(result).toEqual(mockData); // Expect the full mockData object
            expect(fetchWithErrorHandling).toHaveBeenCalledWith('/test-url', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        });
    });

    describe('apiDelete', () => {
        it('should call fetchWithErrorHandling with DELETE method', async () => {
            const mockData = { success: true }; // Simulate full response structure
            jest
                .spyOn(require('../apiUtils'), 'fetchWithErrorHandling')
                .mockResolvedValueOnce(mockData);

            const result = await apiDelete('/test-url');
            expect(result).toEqual(mockData); // Expect the full mockData object
            expect(fetchWithErrorHandling).toHaveBeenCalledWith('/test-url', {
                method: 'DELETE',
            });
        });
    });

    describe('apiPatch', () => {
        it('should call fetchWithErrorHandling with PATCH method and body', async () => {
            const mockData = { success: true, data: { id: 1 } }; // Simulate full response structure
            jest
                .spyOn(require('../apiUtils'), 'fetchWithErrorHandling')
                .mockResolvedValueOnce(mockData);
            const body = { name: 'Patched Item' };

            const result = await apiPatch('/test-url', body);
            expect(result).toEqual(mockData); // Expect the full mockData object
            expect(fetchWithErrorHandling).toHaveBeenCalledWith('/test-url', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        });
    });
});
