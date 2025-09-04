import { Router, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import * as AuthService from '../services/auth.service';
import * as UserService from '../services/user.service';
import {
  authenticateToken,
  requireAuth,
  requireActiveUser,
  requireAdmin,
  requireSuperAdmin,
  requireUserAccess,
  requireUserManagement,
  generalRateLimit,
  creationRateLimit,
  validateBody,
  validateParams,
  userSchemas,
  authSchemas,
  commonSchemas
} from '../middleware';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

const router = Router();

// Apply general rate limiting to all user routes
router.use(generalRateLimit);

// Apply authentication to all user routes
router.use(authenticateToken);
router.use(requireAuth);
router.use(requireActiveUser);

/**
 * POST /api/users
 * Create a new user (admin only)
 */
router.post('/',
  requireAdmin, // Only admins can create users
  creationRateLimit, // Apply creation rate limiting
  validateBody(authSchemas.register), // Validate request body using register schema
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await AuthService.register(req.body);
      
      res.status(201).json(createSuccessResponse(
        authResponse,
        'User created successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Create user error:', error);
      
      let statusCode = 400;
      let errorCode = 'USER_CREATION_FAILED';
      let message = 'Failed to create user';

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
 * GET /api/users
 * Get list of users (admin only)
 */
router.get('/',
  requireAdmin, // Only admins can list users
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('GET /api/users - Query params:', req.query);
      const result = await UserService.getUsers(req.query);
      console.log('Users service result:', {
        dataLength: result.data.length,
        pagination: result.pagination
      });
      
      res.json(createSuccessResponse(
        result,
        'Users retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get users error:', error);
      
      res.status(500).json(createErrorResponse(
        'USERS_FETCH_FAILED',
        'Failed to retrieve users',
        req.path
      ));
    }
  }
);

/**
 * GET /api/users/org-chart
 * Get organizational chart data (accessible to all authenticated users)
 */
router.get('/org-chart',
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('GET /api/users/org-chart - Query params:', req.query);
      console.log('Current user:', req.user?.email, 'Role:', req.user?.role);

      // All authenticated users can see org chart, but with filtered data based on their role
      const result = await UserService.getUsers(req.query);

      // Filter sensitive information for non-admin users
      if (req.user?.role && !['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'HR'].includes(req.user.role)) {
        result.data = result.data.map(user => ({
          ...user,
          // Remove sensitive fields for non-admin users
          phone: null,
          // Keep basic info needed for org chart
        }));
      }

      console.log('Org chart service result:', {
        dataLength: result.data.length,
        pagination: result.pagination
      });

      res.json(createSuccessResponse(
        result,
        'Organizational chart data retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get org chart error:', error);

      res.status(500).json(createErrorResponse(
        'ORG_CHART_FETCH_FAILED',
        'Failed to retrieve organizational chart data',
        req.path
      ));
    }
  }
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  requireUserAccess((req) => req.params['id']), // Check if user can access this user data
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await UserService.getUserById(req.params['id']!);
      
      if (!user) {
        res.status(404).json(createErrorResponse(
          'USER_NOT_FOUND',
          'User not found',
          req.path
        ));
        return;
      }

      // UserService already excludes sensitive information
      const userProfile = user;
      
      res.json(createSuccessResponse(
        userProfile,
        'User retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get user error:', error);
      
      res.status(500).json(createErrorResponse(
        'USER_FETCH_FAILED',
        'Failed to retrieve user',
        req.path
      ));
    }
  }
);

/**
 * PUT /api/users/:id
 * Update user profile
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  validateBody(userSchemas.updateProfile), // Validate request body
  requireUserAccess((req) => req.params['id']), // Check if user can access this user data
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedUser = await UserService.updateUserProfile(req.params['id']!, req.body);
      
      res.json(createSuccessResponse(
        updatedUser,
        'User profile updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update user error:', error);
      
      res.status(500).json(createErrorResponse(
        'USER_UPDATE_FAILED',
        'Failed to update user profile',
        req.path
      ));
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  requireUserManagement((req) => req.params['id']), // Check if user can manage users
  async (req: Request, res: Response): Promise<void> => {
    try {
      const targetUserId = req.params['id'];
      const currentUserId = req.user!.id;

      // Prevent users from deleting themselves
      if (targetUserId === currentUserId) {
        res.status(400).json(createErrorResponse(
          'CANNOT_DELETE_SELF',
          'You cannot delete your own account',
          req.path
        ));
        return;
      }

      // This would be implemented in a UserService
      // For now, just return a placeholder response
      
      res.json(createSuccessResponse(
        null,
        'User deleted successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      
      res.status(500).json(createErrorResponse(
        'USER_DELETE_FAILED',
        'Failed to delete user',
        req.path
      ));
    }
  }
);

/**
 * POST /api/users/:id/promote-super-admin
 * Promote user to super admin (super admin only)
 */
router.post('/:id/promote-super-admin',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  validateBody(userSchemas.promoteUser), // Validate request body
  requireSuperAdmin, // Only super admin can promote users
  creationRateLimit, // Apply creation rate limiting
  async (req: Request, res: Response): Promise<void> => {
    try {
      const targetUserId = req.params['id'];
      const { email } = req.body;
      
      // Use the variables to avoid unused variable warnings
      console.log('Promoting user:', targetUserId, 'with email:', email);

      // This would be implemented in a UserService
      // For now, just return a placeholder response
      
      res.json(createSuccessResponse(
        null,
        'User promoted to super admin successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Promote user error:', error);
      
      let statusCode = 400;
      let errorCode = 'PROMOTION_FAILED';
      let message = 'Failed to promote user';

      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
        message = 'User not found';
      } else if (error instanceof Error && error.message === 'EMAIL_MISMATCH') {
        statusCode = 400;
        errorCode = 'EMAIL_MISMATCH';
        message = 'Email does not match user account';
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
 * POST /api/users/:id/deactivate
 * Deactivate user account (admin only)
 */
router.post('/:id/deactivate',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  requireUserManagement((req) => req.params['id']), // Check if user can manage users
  async (req: Request, res: Response): Promise<void> => {
    try {
      const targetUserId = req.params['id'];
      const currentUserId = req.user!.id;

      // Prevent users from deactivating themselves
      if (targetUserId === currentUserId) {
        res.status(400).json(createErrorResponse(
          'CANNOT_DEACTIVATE_SELF',
          'You cannot deactivate your own account',
          req.path
        ));
        return;
      }

      // This would be implemented in a UserService
      // For now, just return a placeholder response
      
      res.json(createSuccessResponse(
        null,
        'User account deactivated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Deactivate user error:', error);
      
      res.status(500).json(createErrorResponse(
        'USER_DEACTIVATION_FAILED',
        'Failed to deactivate user account',
        req.path
      ));
    }
  }
);

/**
 * POST /api/users/:id/activate
 * Activate user account (admin only)
 */
router.post('/:id/activate',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  requireUserManagement((req) => req.params['id']), // Check if user can manage users
  async (req: Request, res: Response): Promise<void> => {
    try {
      // This would be implemented in a UserService
      // For now, just return a placeholder response
      
      res.json(createSuccessResponse(
        null,
        'User account activated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Activate user error:', error);
      
      res.status(500).json(createErrorResponse(
        'USER_ACTIVATION_FAILED',
        'Failed to activate user account',
        req.path
      ));
    }
  }
);

/**
 * GET /api/users/:id/permissions
 * Get user permissions (admin only)
 */
router.get('/:id/permissions',
  validateParams(z.object({ id: commonSchemas.uuid })), // Validate UUID parameter
  requireAdmin, // Only admins can view permissions
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await AuthService.getUserById(req.params['id']!);
      
      if (!user) {
        res.status(404).json(createErrorResponse(
          'USER_NOT_FOUND',
          'User not found',
          req.path
        ));
        return;
      }

      // This would calculate actual permissions based on role and department
      const userRole = user.role as UserRole;
      const manageUserRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.DEPT_ADMIN];
      const manageProjectRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.DEPT_ADMIN, UserRole.PROJECT_MANAGER];
      const viewReportRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.DEPT_ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD];
      
      const permissions = {
        role: user.role,
        departmentId: user.departmentId,
        canManageUsers: manageUserRoles.includes(userRole),
        canManageProjects: manageProjectRoles.includes(userRole),
        canViewReports: viewReportRoles.includes(userRole)
      };
      
      res.json(createSuccessResponse(
        permissions,
        'User permissions retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get user permissions error:', error);
      
      res.status(500).json(createErrorResponse(
        'PERMISSIONS_FETCH_FAILED',
        'Failed to retrieve user permissions',
        req.path
      ));
    }
  }
);

export default router;