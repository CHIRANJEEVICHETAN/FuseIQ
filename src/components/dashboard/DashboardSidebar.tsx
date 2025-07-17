import { 
  Home, 
  CheckSquare, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3,
  UserCheck,
  Plane,
  Receipt,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  requiredRoles?: string[];
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

export const DashboardSidebar = ({ activeSection, onSectionChange, userRole }: DashboardSidebarProps) => {
  const hasPermission = (requiredRoles?: string[]) => {
    if (!requiredRoles) return true;
    return requiredRoles.includes(userRole);
  };

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      active: activeSection === "dashboard",
      onClick: () => onSectionChange("dashboard")
    },
    {
      name: "Tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      active: activeSection === "tasks",
      onClick: () => onSectionChange("tasks")
    },
    {
      name: "Time Tracking",
      icon: <Clock className="h-5 w-5" />,
      active: activeSection === "time",
      onClick: () => onSectionChange("time")
    },
    {
      name: "Attendance",
      icon: <UserCheck className="h-5 w-5" />,
      active: activeSection === "attendance",
      onClick: () => onSectionChange("attendance")
    },
    {
      name: "Leave Management",
      icon: <Plane className="h-5 w-5" />,
      active: activeSection === "leave",
      onClick: () => onSectionChange("leave")
    },
    {
      name: "Expenses",
      icon: <Receipt className="h-5 w-5" />,
      active: activeSection === "expenses",
      onClick: () => onSectionChange("expenses")
    },
    {
      name: "User Management",
      icon: <UserCog className="h-5 w-5" />,
      active: activeSection === "users",
      onClick: () => onSectionChange("users"),
      requiredRoles: ['super_admin', 'org_admin', 'dept_admin']
    },
    {
      name: "Team",
      icon: <Users className="h-5 w-5" />,
      active: activeSection === "team",
      onClick: () => onSectionChange("team")
    },
    {
      name: "Calendar",
      icon: <Calendar className="h-5 w-5" />,
      active: activeSection === "calendar",
      onClick: () => onSectionChange("calendar")
    },
    {
      name: "Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      active: activeSection === "reports",
      onClick: () => onSectionChange("reports")
    },
    {
      name: "Documents",
      icon: <FileText className="h-5 w-5" />,
      active: activeSection === "documents",
      onClick: () => onSectionChange("documents")
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: activeSection === "settings",
      onClick: () => onSectionChange("settings")
    }
  ];

  const visibleItems = sidebarItems.filter(item => hasPermission(item.requiredRoles));

  return (
    <aside className="bg-gradient-glass backdrop-blur-glass border-r border-white/20 w-64 flex flex-col shadow-glass-lg">
      <div className="p-6">
        <nav className="space-y-2">
          {visibleItems.map((item) => (
            <Button
              key={item.name}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300 hover:bg-white/20",
                item.active && "bg-gradient-primary text-white shadow-glass-sm hover:bg-gradient-primary/90"
              )}
              onClick={item.onClick}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-4 shadow-glass-sm">
          <h3 className="font-semibold text-sm mb-2">Role: {userRole.replace('_', ' ').toUpperCase()}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Full-featured project management system
          </p>
          <Button 
            size="sm" 
            className="w-full bg-gradient-accent hover:opacity-90 transition-all duration-300 shadow-glass-sm"
          >
            View Profile
          </Button>
        </div>
      </div>
    </aside>
  );
};