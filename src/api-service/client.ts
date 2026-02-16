/**
 * API Client - Singleton Pattern with Axios
 * 
 * Centralized API client for all HTTP requests
 * Uses axios with automatic token injection
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '@/utils/auth';
import { env } from '@/config/env';

const API_BASE_URL = env.api.baseUrl;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * API Client Singleton Class
 */
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: env.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add token to all requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle errors globally
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // You can handle global errors here (e.g., 401 redirect)
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Generic request handler
   */
  private async request<T = any>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        return {
          status: error.response.status,
          error: error.response.data?.message || error.response.data?.error || error.message,
        };
      } else if (error.request) {
        // Request made but no response
        return {
          status: 0,
          error: 'No response from server',
        };
      } else {
        // Something else happened
        return {
          status: 0,
          error: error.message || 'Unknown error occurred',
        };
      }
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Upload file with multipart/form-data
   */
  public async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get axios instance (for advanced usage)
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export API base URL for reference
export { API_BASE_URL };
