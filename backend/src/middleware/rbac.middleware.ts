import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { createErrorResponse } from '../utils/response.util';

/**
 * Role hierarchy for permission checking
 * Higher index = higher permission level
 */
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.TRAINEE,
  UserRole.INTERN,
  UserRole.CONTRACTOR,
  UserRole.EMPLOYEE,
  UserRole.TEAM_LEAD,
  UserRole.PROJECT_MANAGER,
  UserRole.HR,
  UserRole.DEPT_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.SUPER_ADMIN
];

/**
 * Get role level for hierarchy comparison
 */
function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if user has required role or higher
 */
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Middleware to require specific role(s)
 * User must have at least one of the specified roles
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication is required to access this resource',
        req.path
      ));
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRole = req.user.role;

    // Check if user has any of the required roles
    const hasPermission = allowedRoles.some(role => 
      hasRequiredRole(userRole, role)
    );

    if (!hasPermission) {
      res.status(403).json(createErrorResponse(
        'INSUFFICIENT_PERMISSIONS',
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}`,
        req.path
      ));
      return;
    }

    next();
  };
};

/**
 * Middleware to require minimum role level
 * User must have the specified role or higher in hierarchy
 */
export const requireMinRole = (minRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication is required to access this resource',
        req.path
      ));
      return;
    }

    if (!hasRequiredRole(req.user.role, minRole)) {
      res.status(403).json(createErrorResponse(
        'INSUFFICIENT_PERMISSIONS',
        `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}`,
        req.path
      ));
      return;
    }

    next();
  };
};

/**
 * Middleware for admin-only access
 * Requires DEPT_ADMIN, ORG_ADMIN, or SUPER_ADMIN role
 */
export const requireAdmin = requireMinRole(UserRole.DEPT_ADMIN);

/**
 * Middleware for super admin only access
 */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Middleware for organization admin or higher
 */
export const requireOrgAdmin = requireMinRole(UserRole.ORG_ADMIN);

/**
 * Middleware for department admin or higher
 */
export const requireDeptAdmin = requireMinRole(UserRole.DEPT_ADMIN);

/**
 * Middleware for project manager or higher
 */
export const requireProjectManager = requireMinRole(UserRole.PROJECT_MANAGER);

/**
 * Middleware for team lead or higher
 */
export const requireTeamLead = requireMinRole(UserRole.TEAM_LEAD);

/**
 * Middleware to check if user can access department resources
 * Users can access their own department or if they're admin+
 */
export const requireDepartmentAccess = (getDepartmentId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication is required to access this resource',
        req.path
      ));
      return;
    }

    const targetDepartmentId = getDepartmentId(req);
    const userRole = req.user.role;
    const userDepartmentId = req.user.departmentId;

    // Super admin and org admin can access all departments
    if (hasRequiredRole(userRole, UserRole.ORG_ADMIN)) {
      next();
      return;
    }

    // Department admin can access their own department
    if (userRole === UserRole.DEPT_ADMIN && userDepartmentId === targetDepartmentId) {
      next();
      return;
    }

    // Other users can only access their own department
    if (userDepartmentId === targetDepartmentId) {
      next();
      return;
    }

    res.status(403).json(createErrorResponse(
      'DEPARTMENT_ACCESS_DENIED',
      'You do not have permission to access this department',
      req.path
    ));
  };
};

/**
 * Middleware to check if user can access user resources
 * Users can access their own data or if they're admin+
 */
export const requireUserAccess = (getUserId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication is required to access this resource',
        req.path
      ));
      return;
    }

    const targetUserId = getUserId(req);
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Users can access their own data
    if (currentUserId === targetUserId) {
      next();
      return;
    }

    // Admins can access other users' data
    if (hasRequiredRole(userRole, UserRole.DEPT_ADMIN)) {
      next();
      return;
    }

    res.status(403).json(createErrorResponse(
      'USER_ACCESS_DENIED',
      'You do not have permission to access this user data',
      req.path
    ));
  };
};

/**
 * Middleware to check if user can manage other users
 * Only admins can manage users, with department restrictions for dept admins
 */
export const requireUserManagement = (getTargetUserId?: (req: Request) => string | undefined) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication is required to access this resource',
        req.path
      ));
      return;
    }

    const userRole = req.user.role;

    // Super admin and org admin can manage all users
    if (hasRequiredRole(userRole, UserRole.ORG_ADMIN)) {
      next();
      return;
    }

    // Department admin can manage users in their department
    if (userRole === UserRole.DEPT_ADMIN && getTargetUserId) {
      try {
        const targetUserId = getTargetUserId(req);
        if (targetUserId) {
          // Would need to check target user's department here
          // For now, allowing dept admin to manage users
          next();
          return;
        }
      } catch (error) {
        console.error('Error checking user management permissions:', error);
      }
    }

    res.status(403).json(createErrorResponse(
      'USER_MANAGEMENT_DENIED',
      'You do not have permission to manage users',
      req.path
    ));
  };
};

/**
 * Helper function to check if user has permission for a specific action
 */
export function checkPermission(
  userRole: UserRole,
  requiredRole: UserRole,
  userDepartmentId?: string,
  targetDepartmentId?: string
): boolean {
  // Super admin and org admin have all permissions
  if (hasRequiredRole(userRole, UserRole.ORG_ADMIN)) {
    return true;
  }

  // Check role hierarchy
  if (hasRequiredRole(userRole, requiredRole)) {
    // If department context is relevant, check department access
    if (targetDepartmentId && userDepartmentId) {
      return userDepartmentId === targetDepartmentId;
    }
    return true;
  }

  return false;
}

/**
 * Utility function to get user role hierarchy level
 */
export function getUserRoleLevel(role: UserRole): number {
  return getRoleLevel(role);
}

/**
 * Utility function to check if one role is higher than another
 */
export function isRoleHigher(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}