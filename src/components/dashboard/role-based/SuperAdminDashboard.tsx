import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Database, 
  Users, 
  Building, 
  Globe, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server,
  Lock,
  BarChart3,
  Settings,
  RefreshCw
} from "lucide-react";

export const SuperAdminDashboard = () => {
  const systemStats = [
    {
      title: "Total Users",
      value: "1,247",
      icon: <Users className="h-4 w-4" />,
      change: "+12 this week",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Active Organizations",
      value: "23",
      icon: <Building className="h-4 w-4" />,
      change: "+2 this month",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      icon: <Server className="h-4 w-4" />,
      change: "Last 30 days",
      color: "text-green-500",
      trend: "stable"
    },
    {
      title: "Security Alerts",
      value: "3",
      icon: <Shield className="h-4 w-4" />,
      change: "2 resolved today",
      color: "text-orange-500",
      trend: "down"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "New organization registered",
      details: "TechCorp Inc. - 50 employees",
      timestamp: "2 minutes ago",
      type: "organization",
      status: "pending"
    },
    {
      id: "2",
      action: "System backup completed",
      details: "Full backup - 2.3GB data",
      timestamp: "1 hour ago",
      type: "system",
      status: "completed"
    },
    {
      id: "3",
      action: "Security scan completed",
      details: "No vulnerabilities found",
      timestamp: "3 hours ago",
      type: "security",
      status: "completed"
    },
    {
      id: "4",
      action: "Database optimization",
      details: "Query performance improved by 15%",
      timestamp: "6 hours ago",
      type: "system",
      status: "completed"
    }
  ];

  const systemHealth = [
    { name: "Database", status: "healthy", usage: 65 },
    { name: "Redis Cache", status: "healthy", usage: 42 },
    { name: "File Storage", status: "healthy", usage: 78 },
    { name: "Email Service", status: "healthy", usage: 23 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "organization": return <Building className="h-4 w-4" />;
      case "system": return <Server className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete system oversight and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
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
        {/* System Health */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {service.usage}%
                    </span>
                  </div>
                </div>
                <Progress value={service.usage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent System Activities
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
              <Database className="h-6 w-6" />
              <span className="text-sm">Backup System</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Security Scan</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">User Audit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">System Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Database connection pool near capacity</p>
                <p className="text-xs text-muted-foreground">Consider scaling database connections</p>
              </div>
              <Button size="sm" variant="outline">Resolve</Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Scheduled maintenance completed</p>
                <p className="text-xs text-muted-foreground">All systems are running optimally</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
