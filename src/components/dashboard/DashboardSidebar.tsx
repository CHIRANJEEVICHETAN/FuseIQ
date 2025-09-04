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
  UserCog,
  Shield,
  Database,
  Building,
  UserPlus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lock,
  Globe,
  Briefcase,
  GraduationCap,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  requiredRoles?: string[];
  minRole?: string;
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
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

export const DashboardSidebar = ({ activeSection, onSectionChange, userRole }: DashboardSidebarProps) => {
  const getRoleLevel = (role: string): number => {
    return ROLE_HIERARCHY.indexOf(role);
  };

  const hasPermission = (requiredRoles?: string[], minRole?: string): boolean => {
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return false;
    }
    
    if (minRole) {
      const userLevel = getRoleLevel(userRole);
      const minLevel = getRoleLevel(minRole);
      return userLevel >= minLevel;
    }
    
    return true;
  };

  const sidebarItems: SidebarItem[] = [
    // Core features available to all roles
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
      name: "Calendar",
      icon: <Calendar className="h-5 w-5" />,
      active: activeSection === "calendar",
      onClick: () => onSectionChange("calendar")
    },
    
    // Team and project management (Team Lead and above)
    {
      name: "Team",
      icon: <Users className="h-5 w-5" />,
      active: activeSection === "team",
      onClick: () => onSectionChange("team"),
      minRole: 'TEAM_LEAD'
    },
    {
      name: "Projects",
      icon: <Briefcase className="h-5 w-5" />,
      active: activeSection === "projects",
      onClick: () => onSectionChange("projects"),
      minRole: 'PROJECT_MANAGER'
    },
    
    // HR specific features
    {
      name: "Recruitment",
      icon: <UserPlus className="h-5 w-5" />,
      active: activeSection === "recruitment",
      onClick: () => onSectionChange("recruitment"),
      requiredRoles: ['HR', 'DEPT_ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN']
    },
    {
      name: "Performance",
      icon: <TrendingUp className="h-5 w-5" />,
      active: activeSection === "performance",
      onClick: () => onSectionChange("performance"),
      requiredRoles: ['HR', 'DEPT_ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN']
    },
    {
      name: "Learning & Development",
      icon: <GraduationCap className="h-5 w-5" />,
      active: activeSection === "learning",
      onClick: () => onSectionChange("learning"),
      requiredRoles: ['HR', 'DEPT_ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN']
    },
    {
      name: "Employee Wellness",
      icon: <Heart className="h-5 w-5" />,
      active: activeSection === "wellness",
      onClick: () => onSectionChange("wellness"),
      requiredRoles: ['HR', 'DEPT_ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN']
    },
    
    // Payroll and financial management (HR and above)
    {
      name: "Payroll",
      icon: <DollarSign className="h-5 w-5" />,
      active: activeSection === "payroll",
      onClick: () => onSectionChange("payroll"),
      minRole: 'HR'
    },
    {
      name: "Compensation",
      icon: <TrendingUp className="h-5 w-5" />,
      active: activeSection === "compensation",
      onClick: () => onSectionChange("compensation"),
      minRole: 'HR'
    },
    
    // User and organization management (Admin levels)
    {
      name: "User Management",
      icon: <UserCog className="h-5 w-5" />,
      active: activeSection === "users",
      onClick: () => onSectionChange("users"),
      minRole: 'DEPT_ADMIN'
    },
    {
      name: "Organization",
      icon: <Building className="h-5 w-5" />,
      active: activeSection === "organization",
      onClick: () => onSectionChange("organization"),
      minRole: 'ORG_ADMIN'
    },
    
    // System administration (Super Admin only)
    {
      name: "System Config",
      icon: <Settings className="h-5 w-5" />,
      active: activeSection === "system-config",
      onClick: () => onSectionChange("system-config"),
      requiredRoles: ['SUPER_ADMIN']
    },
    {
      name: "Backup & Restore",
      icon: <Database className="h-5 w-5" />,
      active: activeSection === "backup",
      onClick: () => onSectionChange("backup"),
      requiredRoles: ['SUPER_ADMIN']
    },
    {
      name: "Security & Compliance",
      icon: <Shield className="h-5 w-5" />,
      active: activeSection === "security",
      onClick: () => onSectionChange("security"),
      requiredRoles: ['SUPER_ADMIN']
    },
    {
      name: "Multi-tenant",
      icon: <Globe className="h-5 w-5" />,
      active: activeSection === "multi-tenant",
      onClick: () => onSectionChange("multi-tenant"),
      requiredRoles: ['SUPER_ADMIN']
    },
    
    // Reports and analytics (varies by role)
    {
      name: "Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      active: activeSection === "reports",
      onClick: () => onSectionChange("reports")
    },
    {
      name: "Analytics",
      icon: <TrendingUp className="h-5 w-5" />,
      active: activeSection === "analytics",
      onClick: () => onSectionChange("analytics"),
      minRole: 'TEAM_LEAD'
    },
    
    // Documents and knowledge management
    {
      name: "Documents",
      icon: <FileText className="h-5 w-5" />,
      active: activeSection === "documents",
      onClick: () => onSectionChange("documents")
    },
    
    // Settings (role-based)
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: activeSection === "settings",
      onClick: () => onSectionChange("settings")
    }
  ];

  const visibleItems = sidebarItems.filter(item => hasPermission(item.requiredRoles, item.minRole));

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
            Access Level: {getRoleLevel(userRole) + 1}/10
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