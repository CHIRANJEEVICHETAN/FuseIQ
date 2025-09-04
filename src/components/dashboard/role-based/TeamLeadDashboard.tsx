import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Clock, 
  Calendar,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  FileText,
  Plus,
  MessageSquare
} from "lucide-react";

export const TeamLeadDashboard = () => {
  const teamStats = [
    {
      title: "Team Members",
      value: "8",
      icon: <Users className="h-4 w-4" />,
      change: "All active",
      color: "text-blue-500",
      trend: "stable"
    },
    {
      title: "Active Tasks",
      value: "24",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "6 completed today",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Team Productivity",
      value: "94%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "+3% this week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Sprint Progress",
      value: "78%",
      icon: <Target className="h-4 w-4" />,
      change: "On track for deadline",
      color: "text-blue-500",
      trend: "stable"
    }
  ];

  const teamMembers = [
    { 
      name: "John Smith", 
      role: "Senior Developer", 
      status: "active", 
      tasks: 8, 
      productivity: 95,
      avatar: "JS"
    },
    { 
      name: "Sarah Johnson", 
      role: "Frontend Developer", 
      status: "active", 
      tasks: 6, 
      productivity: 92,
      avatar: "SJ"
    },
    { 
      name: "Mike Chen", 
      role: "Backend Developer", 
      status: "active", 
      tasks: 7, 
      productivity: 88,
      avatar: "MC"
    },
    { 
      name: "Emily Davis", 
      role: "QA Engineer", 
      status: "on-leave", 
      tasks: 0, 
      productivity: 0,
      avatar: "ED"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Sprint planning completed",
      details: "Next sprint - 12 story points planned",
      timestamp: "1 hour ago",
      type: "sprint",
      status: "completed"
    },
    {
      id: "2",
      action: "Code review completed",
      details: "John's PR #123 approved and merged",
      timestamp: "3 hours ago",
      type: "review",
      status: "completed"
    },
    {
      id: "3",
      action: "Team standup",
      details: "Daily standup - all blockers identified",
      timestamp: "1 day ago",
      type: "meeting",
      status: "completed"
    },
    {
      id: "4",
      action: "Performance feedback",
      details: "Monthly 1:1 with Sarah scheduled",
      timestamp: "2 days ago",
      type: "feedback",
      status: "scheduled"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sprint": return <Target className="h-4 w-4" />;
      case "review": return <CheckSquare className="h-4 w-4" />;
      case "meeting": return <MessageSquare className="h-4 w-4" />;
      case "feedback": return <TrendingUp className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Team Leadership
          </h1>
          <p className="text-muted-foreground mt-1">
            Team management, task oversight, and performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Team Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat, index) => (
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
                    {member.avatar}
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
              Recent Team Activities
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
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Team Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckSquare className="h-6 w-6" />
              <span className="text-sm">Code Review</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Team Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.filter(m => m.status === "active").map((member, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm font-medium">{member.productivity}%</span>
                </div>
                <Progress value={member.productivity} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
