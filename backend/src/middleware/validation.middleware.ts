import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { createErrorResponse } from '../utils/response.util';

// Extend Express Request interface to include file upload
declare module "express-serve-static-core" {
  interface Request {
    file?: {
      size: number;
      mimetype: string;
      filename: string;
      originalname: string;
      buffer: Buffer;
    };
  }
}

/**
 * Validation target types
 */
type ValidationTarget = 'body' | 'query' | 'params' | 'headers';

/**
 * Validation options
 */
interface ValidationOptions {
  target: ValidationTarget;
  schema: ZodSchema;
  optional?: boolean;
}

/**
 * Generic validation middleware factory
 */
export const validate = (options: ValidationOptions | ValidationOptions[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationRules = Array.isArray(options) ? options : [options];
      
      for (const rule of validationRules) {
        const { target, schema, optional = false } = rule;
        const data = req[target];

        // Skip validation if optional and data is undefined/empty
        if (optional && (!data || (typeof data === 'object' && Object.keys(data).length === 0))) {
          continue;
        }

        // Validate data against schema
        const result = schema.safeParse(data);
        
        if (!result.success) {
          const errorDetails = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }));

          res.status(400).json(createErrorResponse(
            'VALIDATION_ERROR',
            `Invalid ${target} data`,
            req.path,
            { errors: errorDetails }
          ));
          return;
        }

        // Replace request data with validated data (this also applies transformations)
        req[target] = result.data;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json(createErrorResponse(
        'VALIDATION_MIDDLEWARE_ERROR',
        'Internal validation error',
        req.path
      ));
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema, optional: boolean = false) => {
  return validate({ target: 'body', schema, optional });
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema, optional: boolean = false) => {
  return validate({ target: 'query', schema, optional });
};

/**
 * Validate route parameters
 */
export const validateParams = (schema: ZodSchema, optional: boolean = false) => {
  return validate({ target: 'params', schema, optional });
};

/**
 * Validate headers
 */
export const validateHeaders = (schema: ZodSchema, optional: boolean = false) => {
  return validate({ target: 'headers', schema, optional });
};

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  // Phone number validation (basic)
  phone: z.string()
    .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
    .optional(),
  
  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0, 'Offset must be non-negative').optional()
  }),
  
  // Date validation
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  // DateTime validation
  datetime: z.string().datetime('Invalid datetime format'),
  
  // Sort parameters
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }),
  
  // Search parameters
  search: z.object({
    q: z.string().min(1, 'Search query cannot be empty').optional(),
    searchFields: z.string().optional()
  })
};

// Authentication validation schemas
export const authSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
    phone: commonSchemas.phone,
    position: z.string().max(100, 'Position too long').optional(),
    departmentId: commonSchemas.uuid.optional()
  }),
  
  passwordReset: z.object({
    email: commonSchemas.email
  }),
  
  passwordResetConfirm: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: commonSchemas.password
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password
  }),
  
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
};

// User validation schemas
export const userSchemas = {
  updateProfile: z.object({
    fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long').optional(),
    phone: commonSchemas.phone,
    position: z.string().max(100, 'Position too long').optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional()
  }),
  
  promoteUser: z.object({
    email: commonSchemas.email
  }),
  
  userQuery: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    ...commonSchemas.search.shape,
    role: z.string().optional(),
    departmentId: commonSchemas.uuid.optional(),
    isActive: z.string().transform(val => val === 'true').optional()
  })
};

// Department validation schemas
export const departmentSchemas = {
  create: z.object({
    name: z.string().min(1, 'Department name is required').max(100, 'Department name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    managerId: commonSchemas.uuid.optional()
  }),
  
  update: z.object({
    name: z.string().min(1, 'Department name is required').max(100, 'Department name too long').optional(),
    description: z.string().max(500, 'Description too long').optional(),
    managerId: commonSchemas.uuid.optional(),
    isActive: z.boolean().optional()
  }),
  
  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    ...commonSchemas.search.shape,
    isActive: z.string().transform(val => val === 'true').optional()
  })
};

// Project validation schemas
export const projectSchemas = {
  create: z.object({
    name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    budget: z.number().positive('Budget must be positive').optional(),
    departmentId: commonSchemas.uuid,
    managerId: commonSchemas.uuid,
    githubRepoUrl: z.string().url('Invalid GitHub repository URL').optional()
  }),
  
  update: z.object({
    name: z.string().min(1, 'Project name is required').max(200, 'Project name too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    budget: z.number().positive('Budget must be positive').optional(),
    managerId: commonSchemas.uuid.optional(),
    githubRepoUrl: z.string().url('Invalid GitHub repository URL').optional()
  }),
  
  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    ...commonSchemas.search.shape,
    status: z.string().optional(),
    priority: z.string().optional(),
    departmentId: commonSchemas.uuid.optional(),
    managerId: commonSchemas.uuid.optional()
  })
};

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Task title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    projectId: commonSchemas.uuid,
    assigneeId: commonSchemas.uuid.optional(),
    parentTaskId: commonSchemas.uuid.optional(),
    estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
    dueDate: commonSchemas.datetime.optional(),
    githubIssueNumber: z.number().int().positive().optional(),
    githubPrNumber: z.number().int().positive().optional()
  }),
  
  update: z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Task title too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assigneeId: commonSchemas.uuid.optional(),
    parentTaskId: commonSchemas.uuid.optional(),
    estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
    actualHours: z.number().positive('Actual hours must be positive').optional(),
    dueDate: commonSchemas.datetime.optional(),
    githubIssueNumber: z.number().int().positive().optional(),
    githubPrNumber: z.number().int().positive().optional()
  }),
  
  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    ...commonSchemas.search.shape,
    status: z.string().optional(),
    priority: z.string().optional(),
    projectId: commonSchemas.uuid.optional(),
    assigneeId: commonSchemas.uuid.optional(),
    reporterId: commonSchemas.uuid.optional()
  })
};

// Time entry validation schemas
export const timeEntrySchemas = {
  create: z.object({
    taskId: commonSchemas.uuid.optional(),
    projectId: commonSchemas.uuid.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    startTime: commonSchemas.datetime,
    endTime: commonSchemas.datetime.optional(),
    durationMinutes: z.number().int().positive('Duration must be positive').optional(),
    isBillable: z.boolean().optional()
  }),
  
  update: z.object({
    taskId: commonSchemas.uuid.optional(),
    projectId: commonSchemas.uuid.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    startTime: commonSchemas.datetime.optional(),
    endTime: commonSchemas.datetime.optional(),
    durationMinutes: z.number().int().positive('Duration must be positive').optional(),
    isBillable: z.boolean().optional()
  }),
  
  timer: z.object({
    taskId: commonSchemas.uuid.optional(),
    projectId: commonSchemas.uuid.optional(),
    description: z.string().max(500, 'Description too long').optional()
  }),
  
  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    taskId: commonSchemas.uuid.optional(),
    projectId: commonSchemas.uuid.optional(),
    isBillable: z.string().transform(val => val === 'true').optional()
  })
};

/**
 * Custom error handler for validation errors
 */
export const handleValidationError = (error: ZodError, req: Request, res: Response): void => {
  const errorDetails = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.code === 'invalid_type' ? (err as { received?: unknown }).received : undefined
  }));

  res.status(400).json(createErrorResponse(
    'VALIDATION_ERROR',
    'Request validation failed',
    req.path,
    { errors: errorDetails }
  ));
};

/**
 * Middleware to handle file upload validation
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;
    
    if (!req.file && required) {
      res.status(400).json(createErrorResponse(
        'FILE_REQUIRED',
        'File upload is required',
        req.path
      ));
      return;
    }

    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        res.status(400).json(createErrorResponse(
          'FILE_TOO_LARGE',
          `File size exceeds maximum allowed size of ${maxSize} bytes`,
          req.path
        ));
        return;
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json(createErrorResponse(
          'INVALID_FILE_TYPE',
          `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          req.path
        ));
        return;
      }
    }

    next();
  };
};