import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TimeTracker } from "@/components/time/TimeTracker";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { LeaveManagement } from "@/components/leave/LeaveManagement";
import { ExpenseManagement } from "@/components/expenses/ExpenseManagement";
import { UserManagement } from "@/components/admin/UserManagement";

const Index = () => {
  const { profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
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
      case "team":
        return <div className="p-6"><h2 className="text-2xl font-bold">Team Management</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "calendar":
        return <div className="p-6"><h2 className="text-2xl font-bold">Calendar</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "reports":
        return <div className="p-6"><h2 className="text-2xl font-bold">Reports</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "documents":
        return <div className="p-6"><h2 className="text-2xl font-bold">Documents</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "settings":
        return <div className="p-6"><h2 className="text-2xl font-bold">Settings</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      default:
        return <DashboardHome />;
    }
  };

  if (!profile) {
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
          name: profile.full_name || profile.email,
          email: profile.email,
          avatar: profile.avatar_url || undefined,
          role: profile.role
        }} 
        onLogout={handleLogout} 
      />
      <div className="flex">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          userRole={profile.role}
        />
        <main className="flex-1 bg-gradient-glass backdrop-blur-glass">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;