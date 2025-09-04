import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Activity,
  BarChart3,
  UserPlus,
  Settings,
  FileText,
  Target,
  Calendar
} from "lucide-react";

export const DeptAdminDashboard = () => {
  const deptStats = [
    {
      title: "Department Members",
      value: "156",
      icon: <Users className="h-4 w-4" />,
      change: "+5 this month",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Active Projects",
      value: "12",
      icon: <Target className="h-4 w-4" />,
      change: "3 completed this week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Team Productivity",
      value: "94%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "+3% from last week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Pending Approvals",
      value: "8",
      icon: <CheckCircle className="h-4 w-4" />,
      change: "2 urgent",
      color: "text-orange-500",
      trend: "stable"
    }
  ];

  const teamMembers = [
    { name: "John Smith", role: "Senior Developer", status: "active", tasks: 8, productivity: 95 },
    { name: "Sarah Johnson", role: "Project Manager", status: "active", tasks: 12, productivity: 92 },
    { name: "Mike Chen", role: "UI/UX Designer", status: "active", tasks: 6, productivity: 88 },
    { name: "Emily Davis", role: "QA Engineer", status: "on-leave", tasks: 0, productivity: 0 },
    { name: "Alex Rodriguez", role: "DevOps Engineer", status: "active", tasks: 10, productivity: 96 }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "New team member onboarded",
      details: "Alex Rodriguez - DevOps Engineer",
      timestamp: "2 hours ago",
      type: "onboarding",
      status: "completed"
    },
    {
      id: "2",
      action: "Project milestone completed",
      details: "E-commerce platform - Phase 2",
      timestamp: "1 day ago",
      type: "project",
      status: "completed"
    },
    {
      id: "3",
      action: "Leave request approved",
      details: "Emily Davis - 3 days vacation",
      timestamp: "2 days ago",
      type: "leave",
      status: "completed"
    },
    {
      id: "4",
      action: "Budget review required",
      details: "Q4 department budget needs approval",
      timestamp: "3 days ago",
      type: "finance",
      status: "pending"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "onboarding": return <UserPlus className="h-4 w-4" />;
      case "project": return <Target className="h-4 w-4" />;
      case "leave": return <Calendar className="h-4 w-4" />;
      case "finance": return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500";
      case "on-leave": return "text-orange-500";
      case "inactive": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Department Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Engineering Department - Team oversight and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Department Report
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Department Settings
          </Button>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deptStats.map((stat, index) => (
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
        {/* Team Members */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.tasks} tasks • {member.productivity}% productivity
                  </p>
                </div>
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
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Add Team Member</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Target className="h-6 w-6" />
              <span className="text-sm">Create Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm">Review Approvals</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Department Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Leave Request - John Smith</p>
                  <p className="text-xs text-muted-foreground">5 days vacation - Dec 20-24</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Approve</Button>
                <Button size="sm" variant="outline">Deny</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Expense Report - Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">$450 - Conference travel</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Approve</Button>
                <Button size="sm" variant="outline">Deny</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
