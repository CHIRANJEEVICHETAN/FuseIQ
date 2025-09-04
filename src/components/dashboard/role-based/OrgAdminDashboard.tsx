import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  UserPlus,
  Settings,
  FileText
} from "lucide-react";

export const OrgAdminDashboard = () => {
  const orgStats = [
    {
      title: "Total Employees",
      value: "1,247",
      icon: <Users className="h-4 w-4" />,
      change: "+23 this month",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Departments",
      value: "12",
      icon: <Building className="h-4 w-4" />,
      change: "2 new departments",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Monthly Payroll",
      value: "$2.4M",
      icon: <DollarSign className="h-4 w-4" />,
      change: "+5.2% from last month",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Active Projects",
      value: "47",
      icon: <CheckCircle className="h-4 w-4" />,
      change: "8 completed this week",
      color: "text-blue-500",
      trend: "up"
    }
  ];

  const departmentStats = [
    { name: "Engineering", employees: 156, budget: "$850K", utilization: 92 },
    { name: "Marketing", employees: 45, budget: "$320K", utilization: 78 },
    { name: "Sales", employees: 89, budget: "$450K", utilization: 85 },
    { name: "HR", employees: 23, budget: "$180K", utilization: 88 },
    { name: "Finance", employees: 34, budget: "$220K", utilization: 95 }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "New department created",
      details: "Research & Development - 15 employees",
      timestamp: "1 hour ago",
      type: "department",
      status: "completed"
    },
    {
      id: "2",
      action: "Monthly payroll processed",
      details: "$2.4M distributed to 1,247 employees",
      timestamp: "3 hours ago",
      type: "payroll",
      status: "completed"
    },
    {
      id: "3",
      action: "Budget review completed",
      details: "Q4 budget approved for all departments",
      timestamp: "1 day ago",
      type: "finance",
      status: "completed"
    },
    {
      id: "4",
      action: "Performance review cycle started",
      details: "Annual reviews for all employees",
      timestamp: "2 days ago",
      type: "hr",
      status: "in-progress"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "department": return <Building className="h-4 w-4" />;
      case "payroll": return <DollarSign className="h-4 w-4" />;
      case "finance": return <TrendingUp className="h-4 w-4" />;
      case "hr": return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Organization Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete organizational management and oversight
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Org Settings
          </Button>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orgStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-white/10 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{dept.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {dept.employees} employees • {dept.budget} budget
                    </p>
                  </div>
                  <span className="text-sm font-medium">{dept.utilization}%</span>
                </div>
                <Progress value={dept.utilization} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="p-2 rounded-full bg-white/10 text-blue-500">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                  <Badge 
                    variant={activity.status === "completed" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Building className="h-6 w-6" />
              <span className="text-sm">Create Department</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Add Employee</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Process Payroll</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Org Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Quarterly All-Hands Meeting</p>
                <p className="text-xs text-muted-foreground">Tomorrow at 2:00 PM</p>
              </div>
              <Badge variant="outline">All Staff</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Monthly Payroll Processing</p>
                <p className="text-xs text-muted-foreground">Due in 3 days</p>
              </div>
              <Badge variant="outline">Finance</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Users className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Performance Review Deadline</p>
                <p className="text-xs text-muted-foreground">Due in 1 week</p>
              </div>
              <Badge variant="outline">HR</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
