// API Client for Express Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  timestamp: string;
  path?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  position?: string;
  departmentId?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getAccessToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Important for CORS with credentials
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // If token expired, try to refresh
      if (response.status === 401 && data.error?.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = TokenManager.getAccessToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          return await retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          this.handleAuthFailure();
          throw new Error('Authentication failed');
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: ApiResponse<AuthResponse> = await response.json();
        if (data.success && data.data) {
          TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private handleAuthFailure(): void {
    TokenManager.clearTokens();
    // Dispatch custom event for auth failure
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.error?.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.error?.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      TokenManager.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get user');
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Password reset request failed');
    }
  }

  async confirmPasswordReset(request: PasswordResetConfirm): Promise<void> {
    const response = await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Password reset failed');
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const response = await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Password change failed');
    }
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    departmentId?: string;
  }): Promise<{ users: User[]; pagination: unknown }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ users: User[]; pagination: unknown }>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get users');
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.request<User>(`/users/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get user');
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to update user');
  }

  // Health check
  async healthCheck(): Promise<unknown> {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
    return await response.json();
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export token manager for external use
export { TokenManager };

// Types are already exported inline above
