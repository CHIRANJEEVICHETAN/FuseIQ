import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

// Role hierarchy for permission checking (higher index = higher permission)
const ROLE_HIERARCHY = [
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
];

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canAccess: () => false,
        hasRole: () => false,
        hasMinRole: () => false,
        canManageUsers: false,
        canManageOrganization: false,
        canManageDepartment: false,
        canManageProjects: false,
        canManageTeam: false,
        canAccessHR: false,
        canAccessPayroll: false,
        canAccessSystemConfig: false,
        canAccessReports: false,
        canAccessAnalytics: false,
        userRole: null,
        userRoleLevel: -1
      };
    }

    const userRole = user.role;
    const userRoleLevel = ROLE_HIERARCHY.indexOf(userRole);

    const getRoleLevel = (role: string): number => {
      return ROLE_HIERARCHY.indexOf(role);
    };

    const canAccess = (requiredRoles?: string[], minRole?: string): boolean => {
      if (requiredRoles && !requiredRoles.includes(userRole)) {
        return false;
      }
      
      if (minRole) {
        const minLevel = getRoleLevel(minRole);
        return userRoleLevel >= minLevel;
      }
      
      return true;
    };

    const hasRole = (role: string): boolean => {
      return userRole === role;
    };

    const hasMinRole = (minRole: string): boolean => {
      const minLevel = getRoleLevel(minRole);
      return userRoleLevel >= minLevel;
    };

    const canPerformAction = (action: string): boolean => {
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
    };

    return {
      canAccess,
      hasRole,
      hasMinRole,
      canPerformAction,
      canManageUsers: hasMinRole('DEPT_ADMIN'),
      canManageOrganization: hasMinRole('ORG_ADMIN'),
      canManageDepartment: hasMinRole('DEPT_ADMIN'),
      canManageProjects: hasMinRole('PROJECT_MANAGER'),
      canManageTeam: hasMinRole('TEAM_LEAD'),
      canAccessHR: hasMinRole('HR'),
      canAccessPayroll: hasMinRole('HR'),
      canAccessSystemConfig: hasRole('SUPER_ADMIN'),
      canAccessReports: true, // All roles can access basic reports
      canAccessAnalytics: hasMinRole('TEAM_LEAD'),
      userRole,
      userRoleLevel
    };
  }, [user]);

  return permissions;
};
