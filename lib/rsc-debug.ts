// Enhanced utility to help debug RSC payload issues and API calls
export const debugRSC = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RSC Debug] ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[RSC Error] ${message}`, error);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[RSC Warning] ${message}`, data);
  },
  
  checkRSCError: (error: any) => {
    const isRSCError = error?.message?.includes('RSC payload') ||
                      error?.message?.includes('NetworkError when attempting to fetch resource') ||
                      error?.message?.includes('fetch') ||
                      error?.digest?.includes('NEXT_NOT_FOUND');
    
    if (isRSCError) {
      debugRSC.error('RSC Payload Error detected', {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      });
    }
    
    return isRSCError;
  },
  
  // Helper to safely navigate without RSC issues
  safeNavigate: (router: any, path: string) => {
    try {
      debugRSC.log(`Navigating to: ${path}`);
      router.push(path);
    } catch (error) {
      debugRSC.error('Navigation failed, falling back to window.location', error);
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    }
  },
  
  // Enhanced API call wrapper with debugging
  safeApiCall: async (url: string, options?: RequestInit, context?: string) => {
    const startTime = Date.now();
    const contextLabel = context || 'API Call';
    
    debugRSC.log(`${contextLabel} - Starting request to: ${url}`, {
      method: options?.method || 'GET',
      headers: options?.headers,
      url
    });
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options?.headers,
        },
      });
      
      const duration = Date.now() - startTime;
      
      debugRSC.log(`${contextLabel} - Response received (${duration}ms)`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        debugRSC.error(`${contextLabel} - HTTP Error`, {
          status: response.status,
          statusText: response.statusText,
          url,
          errorData
        });
        
        // Handle specific HTTP errors
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden');
        }
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        if (response.status >= 500) {
          throw new Error('Server error occurred');
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      debugRSC.log(`${contextLabel} - Data parsed successfully`, {
        dataKeys: Object.keys(data),
        url
      });
      
      return { data, response };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        debugRSC.error(`${contextLabel} - Network Error (${duration}ms)`, {
          message: error.message,
          url,
          duration
        });
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      
      debugRSC.error(`${contextLabel} - Request Failed (${duration}ms)`, {
        error: error instanceof Error ? error.message : error,
        url,
        duration
      });
      
      throw error;
    }
  },
  
  // Query state debugging helper
  logQueryState: (queryKey: string[], data: any, status: string, error?: any) => {
    debugRSC.log(`Query State - ${queryKey.join('/')}`, {
      status,
      hasData: !!data,
      dataType: data ? typeof data : null,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  },
  
  // Component render debugging
  logRender: (componentName: string, props?: any, state?: any) => {
    if (process.env.NODE_ENV === 'development') {
      debugRSC.log(`Component Render - ${componentName}`, {
        props: props ? Object.keys(props) : null,
        state: state ? Object.keys(state) : null,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Performance monitoring
  timeStart: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`[RSC Perf] ${label}`);
    }
  },
  
  timeEnd: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`[RSC Perf] ${label}`);
    }
  },
  
  // Memory usage (browser only)
  logMemory: (context?: string) => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      debugRSC.log(`Memory Usage${context ? ` - ${context}` : ''}`, {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    }
  }
};
