import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RoleBasedDashboard } from "@/components/dashboard/role-based/RoleBasedDashboard";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TimeTracker } from "@/components/time/TimeTracker";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { LeaveManagement } from "@/components/leave/LeaveManagement";
import { ExpenseManagement } from "@/components/expenses/ExpenseManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { OrgChart } from "@/components/org-chart/OrgChart";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <RoleBasedDashboard />;
      case "tasks":
        return <TaskBoard />;
      case "time":
        return <TimeTracker />;
      case "attendance":
        return <AttendanceTracker />;
      case "leave":
        return <LeaveManagement />;
      case "expenses":
        return <ExpenseManagement />;
      case "users":
        return <UserManagement />;
      case "organization":
        return <OrgChart />;
      case "team":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "projects":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Project Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "recruitment":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Recruitment</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "performance":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Performance Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "learning":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Learning & Development</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "wellness":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Employee Wellness</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "payroll":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Payroll Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "compensation":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Compensation Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "system-config":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">System Configuration</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "backup":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Backup & Restore</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "security":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Security & Compliance</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "multi-tenant":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Multi-tenant Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "calendar":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Calendar</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Reports</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "documents":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Documents</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      default:
        return <RoleBasedDashboard />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={{
          name: user.fullName || user.email,
          email: user.email,
          avatar: undefined, // No avatar in current User type
          role: user.role,
        }}
        onLogout={handleLogout}
      />
      <div className="flex">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={user.role}
        />
        <main className="flex-1 bg-gradient-glass backdrop-blur-glass">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
