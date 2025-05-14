import toast from "react-hot-toast";

/**
 * Enhanced error handling for API calls
 * @param error The error object
 * @param customMessage Custom error message to display
 * @param silent If true, no toast notification will be shown
 * @returns The error object for further handling
 */
export const handleApiError = (
  error: any,
  customMessage = "An error occurred. Please try again.",
  silent = false
): Error => {
  // Log the error for debugging
  console.error("API Error:", error);

  // Extract error message if available
  let errorMessage = customMessage;
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Show toast notification unless silent mode is enabled
  if (!silent) {
    toast.error(errorMessage);
  }

  // Return the error for further handling
  return new Error(errorMessage);
};

/**
 * Safely parse JSON without throwing
 * @param jsonString The JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed JSON or fallback value
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return fallback;
  }
};

/**
 * Safely access nested object properties
 * @param obj The object to access
 * @param path The path to the property (e.g., "user.profile.name")
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export const safeObjectAccess = <T>(
  obj: any,
  path: string,
  defaultValue: T
): T => {
  try {
    const keys = path.split(".");
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result === undefined || result === null ? defaultValue : result;
  } catch (error) {
    console.error("Object Access Error:", error);
    return defaultValue;
  }
};

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Promise that resolves with the function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 300
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Validate session token
 * @param token The session token to validate
 * @returns True if token is valid, false otherwise
 */
export const isValidToken = (token: string | undefined | null): boolean => {
  if (!token) return false;
  
  // Simple validation - check if token has expected format
  // In a real app, you might want to decode and check expiration
  return token.length > 20 && token.includes('.');
};

/**
 * Handle socket connection errors
 * @param socket The socket instance
 * @param errorCallback Callback function for error handling
 */
export const setupSocketErrorHandling = (
  socket: any,
  errorCallback?: (error: any) => void
): void => {
  if (!socket) return;
  
  socket.on('connect_error', (error: any) => {
    console.error('Socket connection error:', error);
    if (errorCallback) errorCallback(error);
  });
  
  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
    if (errorCallback) errorCallback(error);
  });
  
  socket.on('disconnect', (reason: string) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect' || reason === 'io client disconnect') {
      // The disconnection was initiated by the server or client, no need to reconnect
    } else {
      // Attempt to reconnect
      socket.connect();
    }
  });
};
