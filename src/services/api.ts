// Central API Client for TrustRail
// This module provides a unified interface for all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Import mock API when in development mode
let mockApi: any = null;
if (USE_MOCK_API) {
  import('./mockApi').then((module) => {
    mockApi = module.mockApi;
  });
}

/**
 * Central API client with request/response handling
 */
export const api = {
  /**
   * Generic request handler
   * @param endpoint - API endpoint (e.g., '/businesses/123')
   * @param options - Fetch options
   * @returns Parsed JSON response
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use mock API in development if enabled
    if (USE_MOCK_API && mockApi) {
      return mockApi.handleRequest(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  },

  /**
   * GET request
   * @param endpoint - API endpoint
   * @returns Parsed JSON response
   */
  get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Parsed JSON response
   */
  post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Parsed JSON response
   */
  put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns Parsed JSON response
   */
  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },

  /**
   * POST request with FormData (for file uploads)
   * @param endpoint - API endpoint
   * @param formData - FormData object
   * @returns Parsed JSON response
   */
  postFormData<T = any>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      } as any,
    });
  },
};
