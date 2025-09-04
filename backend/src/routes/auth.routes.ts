import { Router, Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import * as JwtUtil from '../utils/jwt.util';
import {
  authRateLimit,
  passwordResetRateLimit,
  validateBody,
  authSchemas,
  authenticateToken,
  requireAuth
} from '../middleware';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register',
  authRateLimit, // Apply rate limiting for auth endpoints
  validateBody(authSchemas.register), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await AuthService.register(req.body);
      
      res.status(201).json(createSuccessResponse(
        authResponse,
        'User registered successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      let statusCode = 400;
      let errorCode = 'REGISTRATION_FAILED';
      let message = 'Registration failed';

      if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
        statusCode = 409;
        errorCode = 'USER_EXISTS';
        message = 'User with this email already exists';
      } else if (error instanceof Error && error.message.startsWith('WEAK_PASSWORD')) {
        errorCode = 'WEAK_PASSWORD';
        message = error.message.replace('WEAK_PASSWORD: ', '');
      } else if (error instanceof Error && error.message === 'INVALID_DEPARTMENT') {
        errorCode = 'INVALID_DEPARTMENT';
        message = 'Invalid department specified';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  authRateLimit, // Apply rate limiting for auth endpoints
  validateBody(authSchemas.login), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await AuthService.login(req.body);
      
      res.json(createSuccessResponse(
        authResponse,
        'Login successful',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      let statusCode = 401;
      let errorCode = 'LOGIN_FAILED';
      let message = 'Invalid credentials';

      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        errorCode = 'INVALID_CREDENTIALS';
        message = 'Invalid email or password';
      } else if (error instanceof Error && error.message === 'ACCOUNT_DEACTIVATED') {
        statusCode = 403;
        errorCode = 'ACCOUNT_DEACTIVATED';
        message = 'Your account has been deactivated';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout',
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Try to extract user ID from token if available, but don't require it
      let userId: string | null = null;
      try {
        const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);
        if (token) {
          const payload = JwtUtil.verifyAccessToken(token);
          userId = payload.userId;
        }
      } catch (error) {
        // Token is invalid/expired, that's okay for logout
        console.log('Token invalid during logout, proceeding anyway');
      }

      const refreshToken = req.body.refreshToken;
      
      if (userId) {
        await AuthService.logout(userId, refreshToken);
      } else if (refreshToken) {
        // If we have a refresh token but no user ID, try to find and remove it
        // This is a fallback for when the access token is expired
        await AuthService.logout('', refreshToken);
      }
      
      res.json(createSuccessResponse(
        null,
        'Logout successful',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Logout error:', error);
      
      // Even if logout fails, return success to clear client-side tokens
      res.json(createSuccessResponse(
        null,
        'Logout successful',
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  authRateLimit, // Apply rate limiting
  validateBody(authSchemas.refreshToken), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await AuthService.refreshToken(req.body.refreshToken);
      
      res.json(createSuccessResponse(
        authResponse,
        'Token refreshed successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
      
      let statusCode = 401;
      let errorCode = 'TOKEN_REFRESH_FAILED';
      let message = 'Token refresh failed';

      if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
        errorCode = 'INVALID_REFRESH_TOKEN';
        message = 'Invalid refresh token';
      } else if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
        errorCode = 'REFRESH_TOKEN_EXPIRED';
        message = 'Refresh token has expired';
      } else if (error instanceof Error && error.message === 'USER_NOT_FOUND_OR_INACTIVE') {
        statusCode = 403;
        errorCode = 'USER_INACTIVE';
        message = 'User account is inactive or not found';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password',
  passwordResetRateLimit, // Apply stricter rate limiting for password reset
  validateBody(authSchemas.passwordReset), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      await AuthService.requestPasswordReset(req.body);
      
      // Always return success to prevent email enumeration
      res.json(createSuccessResponse(
        null,
        'If the email exists, a password reset link has been sent',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Password reset request error:', error);
      
      let statusCode = 400;
      let errorCode = 'PASSWORD_RESET_FAILED';
      let message = 'Password reset request failed';

      if (error instanceof Error && error.message === 'ACCOUNT_DEACTIVATED') {
        statusCode = 403;
        errorCode = 'ACCOUNT_DEACTIVATED';
        message = 'Account is deactivated';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Confirm password reset
 */
router.post('/reset-password',
  passwordResetRateLimit, // Apply rate limiting
  validateBody(authSchemas.passwordResetConfirm), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      await AuthService.confirmPasswordReset(req.body);
      
      res.json(createSuccessResponse(
        null,
        'Password reset successful',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Password reset confirmation error:', error);
      
      let statusCode = 400;
      let errorCode = 'PASSWORD_RESET_FAILED';
      let message = 'Password reset failed';

      if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED_RESET_TOKEN') {
        statusCode = 401;
        errorCode = 'INVALID_RESET_TOKEN';
        message = 'Invalid or expired reset token';
      } else if (error instanceof Error && error.message === 'RESET_TOKEN_EXPIRED') {
        statusCode = 401;
        errorCode = 'RESET_TOKEN_EXPIRED';
        message = 'Reset token has expired';
      } else if (error instanceof Error && error.message.startsWith('WEAK_PASSWORD')) {
        errorCode = 'WEAK_PASSWORD';
        message = error.message.replace('WEAK_PASSWORD: ', '');
      } else if (error instanceof Error && error.message === 'USER_NOT_FOUND_OR_INACTIVE') {
        statusCode = 403;
        errorCode = 'USER_INACTIVE';
        message = 'User account is inactive or not found';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
router.post('/change-password',
  authenticateToken, // Verify JWT token
  requireAuth, // Ensure user is authenticated
  validateBody(authSchemas.changePassword), // Validate request body
  async (req: Request, res: Response): Promise<void> => {
    try {
      await AuthService.changePassword(req.user!.id, req.body);
      
      res.json(createSuccessResponse(
        null,
        'Password changed successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Password change error:', error);
      
      let statusCode = 400;
      let errorCode = 'PASSWORD_CHANGE_FAILED';
      let message = 'Password change failed';

      if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') {
        statusCode = 401;
        errorCode = 'INVALID_CURRENT_PASSWORD';
        message = 'Current password is incorrect';
      } else if (error instanceof Error && error.message.startsWith('WEAK_PASSWORD')) {
        errorCode = 'WEAK_PASSWORD';
        message = error.message.replace('WEAK_PASSWORD: ', '');
      } else if (error instanceof Error && error.message === 'NEW_PASSWORD_SAME_AS_CURRENT') {
        errorCode = 'SAME_PASSWORD';
        message = 'New password must be different from current password';
      } else if (error instanceof Error && error.message === 'USER_NOT_FOUND_OR_INACTIVE') {
        statusCode = 403;
        errorCode = 'USER_INACTIVE';
        message = 'User account is inactive or not found';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me',
  authenticateToken, // Verify JWT token
  requireAuth, // Ensure user is authenticated
  async (req: Request, res: Response): Promise<void> => {
    try {
      // User is already attached to request by authenticateToken middleware
      const user = req.user!;
      
      // Remove sensitive information
      const { password, ...userProfile } = user;
      
      res.json(createSuccessResponse(
        userProfile,
        'User profile retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get user profile error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROFILE_FETCH_FAILED',
        'Failed to retrieve user profile',
        req.path
      ));
    }
  }
);

export default router;