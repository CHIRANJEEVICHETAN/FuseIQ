import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TimeTracker } from "@/components/time/TimeTracker";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: ""
  });

  const handleLogin = async (email: string, password: string) => {
    // Simulate login - in real app, this would call your authentication API
    setTimeout(() => {
      setIsAuthenticated(true);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveSection("dashboard");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
      case "tasks":
        return <TaskBoard />;
      case "time":
        return <TimeTracker />;
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

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={handleLogout} />
      <div className="flex">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 bg-gradient-glass backdrop-blur-glass">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
