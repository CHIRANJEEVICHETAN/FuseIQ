import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '../config/environment';
import { createErrorResponse } from '../utils/response.util';

// Create Redis client for rate limiting
const redisClient = createClient({
  url: config.redis.url,
  password: config.redis.password
});

redisClient.on('error', (err) => {
  console.error('Redis rate limit client error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response): void => {
  res.status(429).json(createErrorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later.',
    req.path,
    JSON.stringify({
      retryAfter: res.getHeader('Retry-After'),
      limit: res.getHeader('X-RateLimit-Limit'),
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset')
    })
  ));
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req: Request): boolean => {
  // Skip rate limiting for health checks
  if (req.path === '/api/health') {
    return true;
  }

  // Skip for super admin users (if authenticated)
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return true;
  }

  return false;
};

/**
 * General API rate limiting
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipRateLimit,
  keyGenerator: (req: Request): string => {
    // Use IP address as key, but include user ID if authenticated for better tracking
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.user?.id;
    return userId ? `general:${userId}:${ip}` : `general:${ip}`;
  }
});

/**
 * Authentication rate limiting
 * More lenient in development, stricter in production
 */
export const authRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 50 : 5, // More lenient in development
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `auth:${ip}`;
  }
});

/**
 * Password reset rate limiting
 * 3 password reset requests per hour per IP
 */
export const passwordResetRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `password-reset:${ip}`;
  }
});

/**
 * File upload rate limiting
 * 20 file uploads per hour per user
 */
export const fileUploadRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 file uploads per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `file-upload:${userId}:${ip}`;
  }
});

/**
 * API creation rate limiting (for POST requests)
 * 30 creation requests per hour per user
 */
export const creationRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each user to 30 creation requests per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `creation:${userId}:${ip}`;
  }
});

/**
 * Strict rate limiting for sensitive operations
 * 10 requests per hour per user
 */
export const strictRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 sensitive requests per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `strict:${userId}:${ip}`;
  }
});

/**
 * Custom rate limiting middleware factory
 * Allows creating custom rate limits for specific endpoints
 */
export const createCustomRateLimit = (options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: options.windowMs,
    max: options.max,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skip: skipRateLimit,
    keyGenerator: (req: Request): string => {
      const userId = req.user?.id || 'anonymous';
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return `${options.keyPrefix}:${userId}:${ip}`;
    }
  });
};

/**
 * Middleware to apply different rate limits based on user role
 */
export const roleBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role;
  
  // Different limits based on role
  let maxRequests = 50; // Default for unauthenticated users
  
  if (userRole) {
    switch (userRole) {
      case 'SUPER_ADMIN':
        maxRequests = 1000; // Very high limit for super admin
        break;
      case 'ORG_ADMIN':
        maxRequests = 500;
        break;
      case 'DEPT_ADMIN':
        maxRequests = 300;
        break;
      case 'PROJECT_MANAGER':
        maxRequests = 200;
        break;
      case 'TEAM_LEAD':
        maxRequests = 150;
        break;
      case 'EMPLOYEE':
        maxRequests = 100;
        break;
      case 'CONTRACTOR':
        maxRequests = 75;
        break;
      case 'INTERN':
        maxRequests = 60;
        break;
      case 'TRAINEE':
        maxRequests = 50;
        break;
      case 'HR':
        maxRequests = 200;
        break;
      default:
        maxRequests = 50;
    }
  }

  // Create dynamic rate limiter
  const dynamicRateLimit = rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: maxRequests,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      const userId = req.user?.id || 'anonymous';
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return `role-based:${userId}:${ip}`;
    }
  });

  dynamicRateLimit(req, res, next);
};

/**
 * Middleware to track and limit concurrent requests per user
 */
export const concurrentRequestLimit = (maxConcurrent: number = 10) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      next();
      return;
    }

    const key = `concurrent:${userId}`;
    
    try {
      // Increment concurrent request counter
      const current = await redisClient.incr(key);
      
      // Set expiration if this is the first request
      if (current === 1) {
        await redisClient.expire(key, 300); // 5 minutes expiration
      }

      if (current > maxConcurrent) {
        // Decrement counter since we're rejecting this request
        await redisClient.decr(key);
        
        res.status(429).json(createErrorResponse(
          'TOO_MANY_CONCURRENT_REQUESTS',
          `Too many concurrent requests. Maximum allowed: ${maxConcurrent}`,
          req.path
        ));
        return;
      }

      // Decrement counter when request completes
      res.on('finish', async () => {
        try {
          await redisClient.decr(key);
        } catch (error) {
          console.error('Error decrementing concurrent request counter:', error);
        }
      });

      next();
    } catch (error) {
      console.error('Concurrent request limit error:', error);
      next(); // Continue on Redis errors
    }
  };
};

/**
 * Cleanup function to close Redis connection
 */
export const cleanup = async (): Promise<void> => {
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('Error closing Redis rate limit client:', error);
  }
};