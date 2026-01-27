/**
 * API Client for frontend to communicate with backend
 */

// Get base URL from environment, default to localhost
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Ensure API_URL ends with /api
// This handles cases where VITE_API_URL is set to just the backend domain
if (!API_URL.endsWith('/api')) {
  // Remove trailing slash if present, then append /api
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    // Get token from Supabase auth session
    try {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try refreshing token once
    if (response.status === 401 && retryCount === 0) {
      const newToken = await this.refreshToken();
      if (newToken) {
        // Retry the request with the new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          const error: ApiError = await retryResponse.json().catch(() => ({
            error: { message: `HTTP ${retryResponse.status}: ${retryResponse.statusText}` },
          }));
          throw new Error(error.error.message);
        }

        // Handle 204 No Content
        if (retryResponse.status === 204) {
          return null as T;
        }

        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      throw new Error(error.error.message);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

