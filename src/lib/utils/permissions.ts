// Role hierarchy for permission checking (higher index = higher permission)
export const ROLE_HIERARCHY = [
  'TRAINEE',
  'INTERN', 
  'CONTRACTOR',
  'EMPLOYEE',
  'TEAM_LEAD',
  'PROJECT_MANAGER',
  'HR',
  'DEPT_ADMIN',
  'ORG_ADMIN',
  'SUPER_ADMIN'
] as const;

export type UserRole = typeof ROLE_HIERARCHY[number];

export interface PermissionCheck {
  userRole: string;
  userDepartmentId?: string;
  targetDepartmentId?: string;
}

/**
 * Get role level for hierarchy comparison
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY.indexOf(role as UserRole);
}

/**
 * Check if user has required role or higher
 */
export function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: string, roles: string[]): boolean {
  return roles.includes(userRole);
}

/**
 * Check if user has department access
 */
export function hasDepartmentAccess(
  userRole: string, 
  userDepartmentId?: string, 
  targetDepartmentId?: string
): boolean {
  // Super admin and org admin can access all departments
  if (hasRequiredRole(userRole, 'ORG_ADMIN')) {
    return true;
  }

  // Department admin can access their own department
  if (userRole === 'DEPT_ADMIN' && userDepartmentId === targetDepartmentId) {
    return true;
  }

  // Other users can only access their own department
  if (userDepartmentId === targetDepartmentId) {
    return true;
  }

  // If no target department specified, allow access
  if (!targetDepartmentId) {
    return true;
  }

  return false;
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: string): boolean {
  return hasRequiredRole(userRole, 'DEPT_ADMIN');
}

/**
 * Check if user can manage organization
 */
export function canManageOrganization(userRole: string): boolean {
  return hasRequiredRole(userRole, 'ORG_ADMIN');
}

/**
 * Check if user can manage department
 */
export function canManageDepartment(userRole: string): boolean {
  return hasRequiredRole(userRole, 'DEPT_ADMIN');
}

/**
 * Check if user can manage projects
 */
export function canManageProjects(userRole: string): boolean {
  return hasRequiredRole(userRole, 'PROJECT_MANAGER');
}

/**
 * Check if user can manage team
 */
export function canManageTeam(userRole: string): boolean {
  return hasRequiredRole(userRole, 'TEAM_LEAD');
}

/**
 * Check if user can access HR features
 */
export function canAccessHR(userRole: string): boolean {
  return hasRequiredRole(userRole, 'HR');
}

/**
 * Check if user can access payroll
 */
export function canAccessPayroll(userRole: string): boolean {
  return hasRequiredRole(userRole, 'HR');
}

/**
 * Check if user can access system configuration
 */
export function canAccessSystemConfig(userRole: string): boolean {
  return userRole === 'SUPER_ADMIN';
}

/**
 * Check if user can access analytics
 */
export function canAccessAnalytics(userRole: string): boolean {
  return hasRequiredRole(userRole, 'TEAM_LEAD');
}

/**
 * Check if user can access reports
 */
export function canAccessReports(userRole: string): boolean {
  return true; // All roles can access basic reports
}

/**
 * Check if user can access specific feature
 */
export function canAccessFeature(
  userRole: string, 
  feature: string, 
  userDepartmentId?: string, 
  targetDepartmentId?: string
): boolean {
  switch (feature) {
    case 'user-management':
      return canManageUsers(userRole);
    case 'organization-management':
      return canManageOrganization(userRole);
    case 'department-management':
      return canManageDepartment(userRole);
    case 'project-management':
      return canManageProjects(userRole);
    case 'team-management':
      return canManageTeam(userRole);
    case 'hr-operations':
      return canAccessHR(userRole);
    case 'payroll':
      return canAccessPayroll(userRole);
    case 'system-config':
      return canAccessSystemConfig(userRole);
    case 'analytics':
      return canAccessAnalytics(userRole);
    case 'reports':
      return canAccessReports(userRole);
    case 'department-access':
      return hasDepartmentAccess(userRole, userDepartmentId, targetDepartmentId);
    default:
      return false;
  }
}

/**
 * Get user's permission level description
 */
export function getPermissionLevel(userRole: string): string {
  const level = getRoleLevel(userRole);
  const descriptions = [
    'Trainee - Basic learning access',
    'Intern - Learning and supervised tasks',
    'Contractor - Project-specific access',
    'Employee - Standard user access',
    'Team Lead - Team management access',
    'Project Manager - Project oversight access',
    'HR - Human resources operations',
    'Department Admin - Department management',
    'Organization Admin - Organization-wide access',
    'Super Admin - Full system access'
  ];
  
  return descriptions[level] || 'Unknown role';
}

/**
 * Check if user can perform specific action
 */
export function canPerformAction(
  userRole: string,
  action: string,
  userDepartmentId?: string,
  targetDepartmentId?: string
): boolean {
  const actionPermissions: Record<string, string[]> = {
    'create-user': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN'],
    'edit-user': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN'],
    'delete-user': ['SUPER_ADMIN', 'ORG_ADMIN'],
    'create-department': ['SUPER_ADMIN', 'ORG_ADMIN'],
    'edit-department': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN'],
    'delete-department': ['SUPER_ADMIN', 'ORG_ADMIN'],
    'create-project': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'PROJECT_MANAGER'],
    'edit-project': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'PROJECT_MANAGER'],
    'delete-project': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN'],
    'create-task': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'],
    'edit-task': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'EMPLOYEE'],
    'delete-task': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'],
    'approve-leave': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'HR'],
    'approve-expense': ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPT_ADMIN', 'HR'],
    'process-payroll': ['SUPER_ADMIN', 'ORG_ADMIN', 'HR'],
    'system-config': ['SUPER_ADMIN'],
    'backup-restore': ['SUPER_ADMIN'],
    'security-settings': ['SUPER_ADMIN']
  };

  const allowedRoles = actionPermissions[action];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(userRole);
}
