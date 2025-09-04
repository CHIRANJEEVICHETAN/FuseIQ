import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface DepartmentBasedAccessProps {
  children: ReactNode;
  targetDepartmentId?: string;
  fallback?: ReactNode;
}

export const DepartmentBasedAccess = ({ 
  children, 
  targetDepartmentId, 
  fallback 
}: DepartmentBasedAccessProps) => {
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

  const hasDepartmentAccess = (): boolean => {
    // Super admin and org admin can access all departments
    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') {
      return true;
    }

    // Department admin can access their own department
    if (user.role === 'DEPT_ADMIN' && user.departmentId === targetDepartmentId) {
      return true;
    }

    // Other users can only access their own department
    if (user.departmentId === targetDepartmentId) {
      return true;
    }

    // If no target department specified, allow access
    if (!targetDepartmentId) {
      return true;
    }

    return false;
  };

  if (!hasDepartmentAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-2">
            You don't have permission to access this department's resources.
          </p>
          <p className="text-sm text-muted-foreground">
            Your department: {user.departmentId || 'Not assigned'}
          </p>
          {targetDepartmentId && (
            <p className="text-sm text-muted-foreground">
              Required department: {targetDepartmentId}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
