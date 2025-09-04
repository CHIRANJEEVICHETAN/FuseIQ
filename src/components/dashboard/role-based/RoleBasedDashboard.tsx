import { useAuth } from "@/contexts/AuthContext";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { OrgAdminDashboard } from "./OrgAdminDashboard";
import { DeptAdminDashboard } from "./DeptAdminDashboard";
import { HRDashboard } from "./HRDashboard";
import { ProjectManagerDashboard } from "./ProjectManagerDashboard";
import { TeamLeadDashboard } from "./TeamLeadDashboard";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { ContractorDashboard } from "./ContractorDashboard";
import { InternDashboard } from "./InternDashboard";
import { TraineeDashboard } from "./TraineeDashboard";

export const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (user.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ORG_ADMIN':
      return <OrgAdminDashboard />;
    case 'DEPT_ADMIN':
      return <DeptAdminDashboard />;
    case 'HR':
      return <HRDashboard />;
    case 'PROJECT_MANAGER':
      return <ProjectManagerDashboard />;
    case 'TEAM_LEAD':
      return <TeamLeadDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    case 'CONTRACTOR':
      return <ContractorDashboard />;
    case 'INTERN':
      return <InternDashboard />;
    case 'TRAINEE':
      return <TraineeDashboard />;
    default:
      return <EmployeeDashboard />; // Default fallback
  }
};
