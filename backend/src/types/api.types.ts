// API Response Types
export interface ApiResponse<T = string> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  path?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request Types
export interface AuthenticatedRequest extends Express.Request {
  user?: import('@prisma/client').User;
}