import { apiFetchClient } from '../api-fetch';
import { ServerResponseModel } from '../typedefs/server-response';

/**
 * Base API Client for making authenticated requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async get<T>(url: string): Promise<ServerResponseModel<T>> {
    return apiFetchClient<T>(url, {
      method: 'GET',
      baseUrl: this.baseUrl,
    });
  }

  async post<T>(url: string, body?: any): Promise<ServerResponseModel<T>> {
    return apiFetchClient<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      baseUrl: this.baseUrl,
    });
  }

  async put<T>(url: string, body?: any): Promise<ServerResponseModel<T>> {
    return apiFetchClient<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      baseUrl: this.baseUrl,
    });
  }

  async delete<T>(url: string): Promise<ServerResponseModel<T>> {
    return apiFetchClient<T>(url, {
      method: 'DELETE',
      baseUrl: this.baseUrl,
    });
  }

  async patch<T>(url: string, body?: any): Promise<ServerResponseModel<T>> {
    return apiFetchClient<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      baseUrl: this.baseUrl,
    });
  }
}

export const apiClient = new ApiClient();