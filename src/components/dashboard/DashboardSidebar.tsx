import { 
  Home, 
  CheckSquare, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
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

  return (
    <aside className="bg-card border-r border-border w-64 flex flex-col">
      <div className="p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                item.active && "bg-primary text-primary-foreground"
              )}
              onClick={item.onClick}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
};