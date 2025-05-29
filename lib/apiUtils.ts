import toast from "react-hot-toast";
import { handleApiError, retryWithBackoff } from "./errorHandling";

interface FetchOptions extends RequestInit {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  retry?: boolean;
  maxRetries?: number;
}

/**
 * Enhanced fetch function with error handling and retries
 * @param url The URL to fetch
 * @param options Fetch options with additional parameters
 * @returns Promise with the response data
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    showSuccessToast = false,
    successMessage = "Operation successful",
    showErrorToast = true,
    errorMessage = "An error occurred. Please try again.",
    retry = false,
    maxRetries = 3,
    ...fetchOptions
  } = options;

  // Set default headers if not provided
  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Create the fetch function
  const fetchFn = async (): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include", // Always include credentials
      });

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text
          errorData = { message: response.statusText };
        }

        const error = new Error(
          errorData.message || errorData.error || errorMessage
        );
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Show success toast if requested
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      return data as T;
    } catch (error) {
      // Handle errors
      if (showErrorToast) {
        handleApiError(error, errorMessage);
      }
      throw error;
    }
  };

  // Use retry with backoff if requested
  if (retry) {
    return retryWithBackoff(fetchFn, maxRetries);
  }

  return fetchFn();
}

/**
 * GET request with error handling
 */
export function apiGet<T>(url: string, options: FetchOptions = {}): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    method: "GET",
    ...options,
  });
}

/**
 * POST request with error handling
 */
export function apiPost<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT request with error handling
 */
export function apiPut<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE request with error handling
 */
export function apiDelete<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    method: "DELETE",
    ...options,
  });
}

/**
 * PATCH request with error handling
 */
export function apiPatch<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...options,
  });
}
