import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import * as JwtUtil from '../utils/jwt.util';
import * as AuthService from '../services/auth.service';
import { createErrorResponse } from '../utils/response.util';

// Extend Express Request interface to include user // adjust path

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}


/**
 * JWT token verification middleware
 * Verifies the access token and attaches user to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json(createErrorResponse(
        'MISSING_TOKEN',
        'Access token is required',
        req.path
      ));
      return;
    }

    // Verify token and get user data
    const user = await AuthService.verifyToken(token);
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error: unknown) {
    console.error('Authentication middleware error:', error);
    
    const statusCode = 401;
    let errorCode = 'AUTHENTICATION_FAILED';
    let message = 'Authentication failed';

    // Handle specific JWT errors
    if (error instanceof Error && error.message === 'ACCESS_TOKEN_EXPIRED') {
      errorCode = 'TOKEN_EXPIRED';
      message = 'Access token has expired';
    } else if (error instanceof Error && error.message === 'INVALID_ACCESS_TOKEN') {
      errorCode = 'INVALID_TOKEN';
      message = 'Invalid access token';
    } else if (error instanceof Error && error.message === 'USER_NOT_FOUND_OR_INACTIVE') {
      errorCode = 'USER_INACTIVE';
      message = 'User account is inactive or not found';
    }

    res.status(statusCode).json(createErrorResponse(
      errorCode,
      message,
      req.path
    ));
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't fail if missing
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const user = await AuthService.verifyToken(token);
        req.user = user;
      } catch (error) {
        // Ignore token errors for optional auth
        console.warn('Optional auth token verification failed:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Middleware to ensure user is authenticated
 * Should be used after authenticateToken
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json(createErrorResponse(
      'AUTHENTICATION_REQUIRED',
      'Authentication is required to access this resource',
      req.path
    ));
    return;
  }

  next();
};

/**
 * Middleware to check if user account is active
 */
export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json(createErrorResponse(
      'AUTHENTICATION_REQUIRED',
      'Authentication is required',
      req.path
    ));
    return;
  }

  if (!req.user.isActive) {
    res.status(403).json(createErrorResponse(
      'ACCOUNT_INACTIVE',
      'Your account has been deactivated',
      req.path
    ));
    return;
  }

  next();
};