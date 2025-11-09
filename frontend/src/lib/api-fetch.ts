import { ServerResponseModel } from "./typedefs/server-response";
import { apiLogger } from "./utils/api-logger";

type ApiFetchOptions = {
  baseUrl?: string;
  withCredentials?: boolean;
  withUpload?: boolean;
  isBlob?: boolean;
} & RequestInit;

export async function apiFetch<T = any>(
  url: string,
  options?: ApiFetchOptions
): Promise<ServerResponseModel<T>> {
  const startTimer = apiLogger.startTimer();
  
  try {
    const {
      withCredentials = false,
      withUpload = false,
      baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api',
      ...fetchOptions
    } = options || {};

    const headers: Record<string, any> = {
      ...fetchOptions?.headers,
    };

    // Add auth token if needed
    if (withCredentials && typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    // Set content type for non-upload requests
    if (!withUpload && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (options?.isBlob) {
      headers["Accept"] = "application/octet-stream";
    }

    const fullUrl = `${baseUrl}${url}`;
    const method = fetchOptions.method || 'GET';

    // Log request
    apiLogger.logRequest({
      url: fullUrl,
      method,
      body: fetchOptions.body,
      headers,
    });
    
    const response = await fetch(fullUrl, { 
      ...fetchOptions, 
      headers 
    });

    const duration = startTimer();

    // Handle non-OK responses
    if (!response.ok) {
      let message = `HTTP ${response.status}: ${response.statusText}`;
      let data;
      
      try {
        data = await response.json();
        message = data.message || data.error || message;
      } catch (_) {
        // If response is not JSON, use status text
      }

      apiLogger.logResponse({
        url: fullUrl,
        method,
        status: response.status,
        data,
        duration,
      });
      
      return { 
        success: false, 
        statusCode: response.status, 
        message 
      };
    }

    // Handle blob responses
    if (options?.isBlob) {
      const blob = await response.blob();
      
      apiLogger.logResponse({
        url: fullUrl,
        method,
        status: response.status,
        duration,
      });
      
      return {
        success: true,
        statusCode: response.status,
        data: blob as T,
      };
    }

    // Handle JSON responses
    const data = await response.json();
    
    apiLogger.logResponse({
      url: fullUrl,
      method,
      status: response.status,
      data,
      duration,
    });
    
    return {
      success: true,
      statusCode: response.status,
      data: data as T,
    };
  } catch (error: any) {
    apiLogger.logError(url, options?.method || 'GET', error);
    
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Network error occurred",
    };
  }
}

// Client-side only API fetch with token from localStorage
export async function apiFetchClient<T = any>(
  url: string,
  options?: Omit<ApiFetchOptions, 'withCredentials'>
): Promise<ServerResponseModel<T>> {
  return apiFetch<T>(url, { ...options, withCredentials: true });
}