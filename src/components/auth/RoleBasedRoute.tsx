import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  minRole?: string;
  fallback?: ReactNode;
}

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

export const RoleBasedRoute = ({ 
  children, 
  requiredRoles, 
  minRole, 
  fallback 
}: RoleBasedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You must be logged in to access this resource.
          </p>
        </div>
      </div>
    );
  }

  const getRoleLevel = (role: string): number => {
    return ROLE_HIERARCHY.indexOf(role);
  };

  const hasPermission = (): boolean => {
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return false;
    }
    
    if (minRole) {
      const userLevel = getRoleLevel(user.role);
      const minLevel = getRoleLevel(minRole);
      return userLevel >= minLevel;
    }
    
    return true;
  };

  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-2">
            You don't have permission to access this resource.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role(s): {requiredRoles ? requiredRoles.join(', ') : minRole || 'Any'}
          </p>
          <p className="text-sm text-muted-foreground">
            Your role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
