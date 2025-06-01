import {
    handleApiError,
    safeJsonParse,
    safeObjectAccess,
    retryWithBackoff,
    isValidToken,
    setupSocketErrorHandling,
    apiErrorResponse,
} from '../errorHandling';
import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

describe('errorHandling', () => {
    beforeEach(() => {
        (toast.error as jest.Mock).mockClear();
        (toast.success as jest.Mock).mockClear();
    });

    describe('handleApiError', () => {
        it('should show a toast with the error message', () => {
            const error = new Error('API call failed');
            handleApiError(error);
            expect(toast.error).toHaveBeenCalledWith('API call failed');
        });

        it('should show a toast with a default message if error message is empty', () => {
            const error = new Error('');
            handleApiError(error);
            expect(toast.error).toHaveBeenCalledWith('An error occurred. Please try again.');
        });

        it('should show a toast with a default message if error is not an Error instance', () => {
            handleApiError('Just a string error');
            expect(toast.error).toHaveBeenCalledWith('An error occurred. Please try again.');
        });
    });

    describe('safeJsonParse', () => {
        it('should parse valid JSON', () => {
            const jsonString = '{"name": "test", "value": 123}';
            const fallback = {};
            const result = safeJsonParse(jsonString, fallback);
            expect(result).toEqual({ name: 'test', value: 123 });
        });

        it('should return fallback for invalid JSON', () => {
            const jsonString = 'invalid json';
            const fallback = { default: true };
            const result = safeJsonParse(jsonString, fallback);
            expect(result).toEqual(fallback);
        });

        it('should return fallback for null or undefined input', () => {
            const fallback = { default: true };
            expect(safeJsonParse(null as any, fallback)).toEqual(fallback);
            expect(safeJsonParse(undefined as any, fallback)).toEqual(fallback);
        });
    });

    describe('safeObjectAccess', () => {
        const obj = {
            a: {
                b: {
                    c: 'nested value',
                    d: [1, 2, 3],
                },
            },
            e: null,
        };

        it('should access nested property successfully', () => {
            expect(safeObjectAccess(obj, 'a.b.c', 'default')).toBe('nested value');
        });

        it('should return fallback for non-existent path', () => {
            expect(safeObjectAccess(obj, 'a.b.z', 'default')).toBe('default');
            expect(safeObjectAccess(obj, 'x.y.z', 'default')).toBe('default');
        });

        it('should return fallback for null or undefined intermediate path', () => {
            expect(safeObjectAccess(obj, 'e.f', 'default')).toBe('default');
            expect(safeObjectAccess(obj, 'a.f.g', 'default')).toBe('default');
        });

        it('should access array elements', () => {
            expect(safeObjectAccess(obj, 'a.b.d.1', 'default')).toBe(2);
        });

        it('should return fallback for out-of-bounds array access', () => {
            expect(safeObjectAccess(obj, 'a.b.d.5', 'default')).toBe('default');
        });

        it('should handle non-object input', () => {
            expect(safeObjectAccess(null, 'a.b.c', 'default')).toBe('default');
            expect(safeObjectAccess(undefined, 'a.b.c', 'default')).toBe('default');
            expect(safeObjectAccess('string', 'a.b.c', 'default')).toBe('default');
        });
    });

    describe('retryWithBackoff', () => {
        jest.useFakeTimers();

        afterEach(() => {
            jest.useRealTimers(); // Restore real timers after each test in this describe block
        });

        it('should succeed on the first attempt', async () => {
            const mockFn = jest.fn().mockResolvedValue('success');
            const result = await retryWithBackoff(mockFn, 3, 100);
            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should retry and succeed on a later attempt', async () => {
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const promise = retryWithBackoff(mockFn, 3, 100);

            // Advance timers to trigger retries. Need to account for baseDelay + jitter.
            // Since jitter is random, we'll advance by slightly more than the max possible delay for each attempt.
            // Delays are baseDelay * 2^attempt + random(0, 100).
            // Attempt 0: 100 * 2^0 + random(0, 100) -> max ~200
            // Attempt 1: 100 * 2^1 + random(0, 100) -> max ~300
            // Attempt 2: 100 * 2^2 + random(0, 100) -> max ~500

            jest.advanceTimersByTime(200); // Advance past max delay for attempt 0
            jest.advanceTimersByTime(300); // Advance past max delay for attempt 1

            const result = await promise;

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(3);
        });

        it('should fail after all retries are exhausted', async () => {
            const mockFn = jest.fn().mockRejectedValue(new Error('always fails'));

            const promise = retryWithBackoff(mockFn, 3, 100);

            // Advance timers to trigger all retries
            // Attempt 0: max ~200
            // Attempt 1: max ~300
            // Attempt 2: max ~500
            jest.advanceTimersByTime(200); // Advance past max delay for attempt 0
            jest.advanceTimersByTime(300); // Advance past max delay for attempt 1
            jest.advanceTimersByTime(500); // Advance past max delay for attempt 2

            await expect(promise).rejects.toThrow('always fails');
            // Expect 1 initial call + 3 retries = 4 calls
            expect(mockFn).toHaveBeenCalledTimes(4);
        });

        it('should use exponential backoff', async () => {
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockRejectedValueOnce(new Error('fail 3'))
                .mockResolvedValue('success');

            const promise = retryWithBackoff(mockFn, 4, 50); // Base delay 50ms

            // Check retry delays: baseDelay * 2^attempt + random(0, 100)
            // Attempt 0: 50 * 1 + random -> max 150
            // Attempt 1: 50 * 2 + random -> max 200
            // Attempt 2: 50 * 4 + random -> max 300
            // Attempt 3: 50 * 8 + random -> max 500

            jest.advanceTimersByTime(150);
            expect(mockFn).toHaveBeenCalledTimes(2); // Initial call + Attempt 0
            jest.advanceTimersByTime(200);
            expect(mockFn).toHaveBeenCalledTimes(3); // + Attempt 1
            jest.advanceTimersByTime(300);
            expect(mockFn).toHaveBeenCalledTimes(4); // + Attempt 2
            jest.advanceTimersByTime(500);

            const result = await promise;
            // Initial call + 4 retries = 5 calls
            expect(mockFn).toHaveBeenCalledTimes(5);
        });
    });

    describe('isValidToken', () => {
        it('should return true for a non-empty string with expected format', () => {
            expect(isValidToken('some.token.with.dots.and.enough.length')).toBe(true);
        });

        it('should return false for an empty string', () => {
            expect(isValidToken('')).toBe(false);
        });

        it('should return false for null', () => {
            expect(isValidToken(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isValidToken(undefined)).toBe(false);
        });
    });

    describe('setupSocketErrorHandling', () => {
        let mockSocket: Partial<Socket>;
        let mockOn: jest.Mock;
        let mockHandleApiError: jest.Mock;

        beforeEach(() => {
            mockOn = jest.fn();
            mockSocket = {
                on: mockOn,
                // Add a mock for the connect method if it's used in the disconnect handler
                connect: jest.fn(),
            };
            mockHandleApiError = jest.fn();
            jest.spyOn(require('../errorHandling'), 'handleApiError').mockImplementation(mockHandleApiError);
        });

        afterEach(() => {
            (require('../errorHandling').handleApiError as jest.Mock).mockRestore();
        });

        it('should register listeners for connect_error, error, and disconnect', () => {
            setupSocketErrorHandling(mockSocket as Socket);
            expect(mockOn).toHaveBeenCalledWith('connect_error', expect.any(Function));
            expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
        });

        it('should call handleApiError on connect_error', () => {
            setupSocketErrorHandling(mockSocket as Socket);
            const connectErrorListener = mockOn.mock.calls.find(call => call[0] === 'connect_error')[1];
            const mockError = new Error('Connection failed');
            // Manually trigger the listener
            connectErrorListener(mockError);
            expect(mockHandleApiError).toHaveBeenCalledWith(mockError, 'Socket connection error: Connection failed');
        });

        it('should call handleApiError on error', () => {
            setupSocketErrorHandling(mockSocket as Socket);
            const errorListener = mockOn.mock.calls.find(call => call[0] === 'error')[1];
            const mockError = new Error('Socket error');
            // Manually trigger the listener
            errorListener(mockError);
            expect(mockHandleApiError).toHaveBeenCalledWith(mockError, 'Socket error: Socket error');
        });

        it('should show toast on disconnect', () => {
            setupSocketErrorHandling(mockSocket as Socket);
            const disconnectListener = mockOn.mock.calls.find(call => call[0] === 'disconnect')[1];
            const reason = 'io server disconnect';
            // Manually trigger the listener
            disconnectListener(reason);
            expect(mockHandleApiError).toHaveBeenCalledWith(`Socket disconnected: ${reason}`);
            // Expect connect to NOT be called for server disconnect
            expect(mockSocket.connect).not.toHaveBeenCalled();
        });

        it('should attempt to reconnect on unexpected disconnect', () => {
            setupSocketErrorHandling(mockSocket as Socket);
            const disconnectListener = mockOn.mock.calls.find(call => call[0] === 'disconnect')[1];
            const reason = 'transport close'; // An unexpected reason
            // Manually trigger the listener
            disconnectListener(reason);
            expect(mockHandleApiError).toHaveBeenCalledWith(`Socket disconnected: ${reason}`);
            // Expect connect to be called for unexpected disconnect
            expect(mockSocket.connect).toHaveBeenCalledTimes(1);
        });
    });

    describe('apiErrorResponse', () => {
        it('should return a JSON response with error, status, and code', async () => {
            const message = 'An error occurred';
            const status = 500;
            const code = 'GENERIC_ERROR';
            const response = apiErrorResponse(message, status, code);
            expect(response.status).toBe(status);
            expect(response.headers.get('Content-Type')).toBe('application/json');
            expect(await response.json()).toEqual({ error: message, status, code });
        });

        it('should return a JSON response with a custom status', async () => {
            const message = 'Not Found';
            const status = 404;
            const code = 'NOT_FOUND_ERROR';
            const response = apiErrorResponse(message, status, code);
            expect(response.status).toBe(status);
            expect(response.headers.get('Content-Type')).toBe('application/json');
            expect(await response.json()).toEqual({ error: message, status, code });
        });

        it('should include details field if provided', async () => {
            const message = 'Detailed error';
            const status = 400;
            const code = 'BAD_REQUEST';
            const details = 'Some specific details';
            const response = apiErrorResponse(message, status, code, details);
            expect(response.status).toBe(status);
            expect(response.headers.get('Content-Type')).toBe('application/json');
            expect(await response.json()).toEqual({ error: message, status, code, details });
        });
    });
});
