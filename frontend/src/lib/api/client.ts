
import { ServerResponseModel } from '../typedefs/server-response';
import { authStorage } from '../utils/local-storage';
import { toast } from '../utils/toast';

/**
 * Cache Entry Interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

/**
 * Request Config Interface
 */
interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  optimistic?: boolean;
}

/**
 * Enhanced API Client with Interceptors, Retry, and Caching
 */
export class ApiClient {
  private baseUrl: string;
  private cache: Map<string, CacheEntry<any>>;
  private pendingRequests: Map<string, Promise<any>>;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>;
  private responseInterceptors: Array<{
    onFulfilled?: (response: any) => any;
    onRejected?: (error: any) => any;
  }>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors
   */
  private setupDefaultInterceptors() {
    // Request Interceptor: Add auth token
    this.addRequestInterceptor((config) => {
      const token = authStorage.getAccessToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      return config;
    });

    // Request Interceptor: Logging (dev only)
    if (process.env.NODE_ENV === 'development') {
      this.addRequestInterceptor((config) => {
        console.log('🌐 API Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
        });
        return config;
      });
    }

    // Response Interceptor: Handle 401 (Unauthorized)
    this.addResponseInterceptor(
      undefined,
      async (error) => {
        if (error.statusCode === 401) {
          // Try to refresh token
          const refreshed = await this.tryRefreshToken(error);
          if (refreshed) {
            return refreshed; // Retry original request
          }

          // Refresh failed → logout
          authStorage.clearAuth();
          toast.error('Session expired. Please login again.');
          
          // Redirect to login (only in browser)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Logging (dev only)
    if (process.env.NODE_ENV === 'development') {
      this.addResponseInterceptor(
        (response) => {
          console.log('✅ API Response:', response);
          return response;
        },
        (error) => {
          console.error('❌ API Error:', error);
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Try to refresh token and retry original request
   */
  private async tryRefreshToken(originalError: any): Promise<any> {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      // Call refresh endpoint
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;

      // Save new token
      authStorage.setAccessToken(newAccessToken);

      // Retry original request with new token
      const originalConfig = originalError.config;
      originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;

      return this.request(originalConfig.url, originalConfig);
    } catch (error) {
      return null;
    }
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(
    onFulfilled?: (response: any) => any,
    onRejected?: (error: any) => any
  ) {
    this.responseInterceptors.push({ onFulfilled, onRejected });
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: any, isError: boolean = false): Promise<any> {
    let finalResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        if (isError && interceptor.onRejected) {
          finalResponse = await interceptor.onRejected(finalResponse);
        } else if (!isError && interceptor.onFulfilled) {
          finalResponse = await interceptor.onFulfilled(finalResponse);
        }
      } catch (error) {
        finalResponse = error;
        isError = true;
      }
    }
    
    return finalResponse;
  }

  /**
   * Get cache key
   */
  private getCacheKey(url: string, config?: RequestConfig): string {
    const method = config?.method || 'GET';
    const body = config?.body ? JSON.stringify(config.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Get cached data
   */
  private getCache<T>(key: string, ttl: number = 5 * 60 * 1000): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache
   */
  private setCache<T>(key: string, data: T, etag?: string) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag,
    });
  }

  /**
   * Invalidate cache by pattern
   */
  invalidateCache(pattern?: string | RegExp) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern.replace(/\*/g, '.*'))
      : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        // Don't retry on 4xx errors (client errors)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Last attempt
        if (attempt === retries) {
          throw error;
        }

        // Calculate delay with exponential backoff + jitter
        const exponentialDelay = Math.min(
          baseDelay * Math.pow(2, attempt),
          10000 // Max 10 seconds
        );
        const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
        const delay = exponentialDelay + jitter;

        console.log(`⏳ Retry attempt ${attempt + 1}/${retries} after ${Math.round(delay)}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Core request method
   */
  private async request<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ServerResponseModel<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const method = config?.method || 'GET';
    const cacheEnabled = config?.cache ?? (method === 'GET');
    const cacheTTL = config?.cacheTTL || 5 * 60 * 1000; // 5 minutes default
    const retries = config?.retries ?? 3;
    const retryDelay = config?.retryDelay ?? 1000;

    // Apply request interceptors
    const finalConfig = await this.applyRequestInterceptors({
      ...config,
      url: fullUrl,
      method,
    });

    // Check cache for GET requests
    if (cacheEnabled && method === 'GET') {
      const cacheKey = this.getCacheKey(url, finalConfig);
      const cached = this.getCache<T>(cacheKey, cacheTTL);
      
      if (cached) {
        console.log('💾 Cache hit:', url);
        return {
          success: true,
          statusCode: 200,
          data: cached,
        };
      }

      // Prevent duplicate requests (request coalescing)
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        console.log('⏳ Request coalescing:', url);
        return pending;
      }
    }

    // Execute request with retry
    const requestPromise = this.retryRequest(async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(finalConfig.headers as Record<string, string>),
      };

      const response = await fetch(fullUrl, {
        ...finalConfig,
        headers,
      });

      const etag = response.headers.get('etag') || undefined;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = {
          success: false,
          statusCode: response.status,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          config: finalConfig,
        };

        // Apply error interceptors
        throw await this.applyResponseInterceptors(error, true);
      }

      const data = await response.json();
      
      const result: ServerResponseModel<T> = {
        success: true,
        statusCode: response.status,
        data: data as T,
      };

      // Apply success interceptors
      const interceptedResult = await this.applyResponseInterceptors(result, false);

      // Cache GET requests
      if (cacheEnabled && method === 'GET') {
        const cacheKey = this.getCacheKey(url, finalConfig);
        this.setCache(cacheKey, interceptedResult.data, etag);
      }

      return interceptedResult;
    }, retries, retryDelay);

    // Store pending request
    if (cacheEnabled && method === 'GET') {
      const cacheKey = this.getCacheKey(url, finalConfig);
      this.pendingRequests.set(cacheKey, requestPromise);
      
      requestPromise.finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    }

    return requestPromise;
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ServerResponseModel<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request (with cache invalidation)
   */
  async post<T>(url: string, body?: any, config?: RequestConfig): Promise<ServerResponseModel<T>> {
    const result = await this.request<T>(url, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related caches
    this.invalidateCacheForMutation(url);

    return result;
  }

  /**
   * PUT request (with cache invalidation)
   */
  async put<T>(url: string, body?: any, config?: RequestConfig): Promise<ServerResponseModel<T>> {
    const result = await this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related caches
    this.invalidateCacheForMutation(url);

    return result;
  }

  /**
   * DELETE request (with cache invalidation)
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ServerResponseModel<T>> {
    const result = await this.request<T>(url, {
      ...config,
      method: 'DELETE',
    });

    // Invalidate related caches
    this.invalidateCacheForMutation(url);

    return result;
  }

  /**
   * PATCH request (with cache invalidation)
   */
  async patch<T>(url: string, body?: any, config?: RequestConfig): Promise<ServerResponseModel<T>> {
    const result = await this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related caches
    this.invalidateCacheForMutation(url);

    return result;
  }

  /**
   * Smart cache invalidation based on mutation URL
   */
  private invalidateCacheForMutation(url: string) {
    // Extract resource from URL
    const parts = url.split('/').filter(Boolean);
    const resource = parts[0]; // e.g., 'vocabularies', 'topics', 'quiz'

    // Invalidate all caches related to this resource
    this.invalidateCache(new RegExp(`GET:.*/${resource}.*`));

    // Special cases: invalidate related resources
    if (resource === 'vocabularies') {
      this.invalidateCache(/GET:.*\/topics.*/); // Topics list might have vocab counts
    } else if (resource === 'topics') {
      this.invalidateCache(/GET:.*\/vocabularies.*/); // Vocabs have topic info
    } else if (resource === 'vocabulary-practice') {
      this.invalidateCache(/GET:.*\/vocabularies.*/);
      this.invalidateCache(/GET:.*\/progress.*/);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export helper to create new instance
export function createApiClient(baseUrl?: string): ApiClient {
  return new ApiClient(baseUrl);
}