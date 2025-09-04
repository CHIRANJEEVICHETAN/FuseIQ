import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  Calendar,
  CheckCircle,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  FileText,
  Plus
} from "lucide-react";

export const ProjectManagerDashboard = () => {
  const projectStats = [
    {
      title: "Active Projects",
      value: "8",
      icon: <Briefcase className="h-4 w-4" />,
      change: "2 completed this week",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Team Members",
      value: "24",
      icon: <Users className="h-4 w-4" />,
      change: "3 new additions",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Project Budget",
      value: "$1.2M",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "85% utilized",
      color: "text-orange-500",
      trend: "stable"
    },
    {
      title: "On-time Delivery",
      value: "92%",
      icon: <CheckCircle className="h-4 w-4" />,
      change: "+5% this quarter",
      color: "text-green-500",
      trend: "up"
    }
  ];

  const activeProjects = [
    { 
      name: "E-commerce Platform", 
      progress: 75, 
      status: "on-track", 
      team: 8, 
      deadline: "Dec 30, 2024",
      budget: "$450K"
    },
    { 
      name: "Mobile App Redesign", 
      progress: 45, 
      status: "at-risk", 
      team: 6, 
      deadline: "Jan 15, 2025",
      budget: "$320K"
    },
    { 
      name: "API Integration", 
      progress: 90, 
      status: "on-track", 
      team: 4, 
      deadline: "Dec 20, 2024",
      budget: "$180K"
    },
    { 
      name: "Data Migration", 
      progress: 30, 
      status: "delayed", 
      team: 5, 
      deadline: "Jan 30, 2025",
      budget: "$250K"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Project milestone completed",
      details: "E-commerce Platform - Phase 2 delivery",
      timestamp: "2 hours ago",
      type: "milestone",
      status: "completed"
    },
    {
      id: "2",
      action: "Team member added",
      details: "Sarah Johnson joined Mobile App project",
      timestamp: "1 day ago",
      type: "team",
      status: "completed"
    },
    {
      id: "3",
      action: "Budget review required",
      details: "Data Migration project - 20% over budget",
      timestamp: "2 days ago",
      type: "budget",
      status: "pending"
    },
    {
      id: "4",
      action: "Risk identified",
      details: "Mobile App - Technical dependency delay",
      timestamp: "3 days ago",
      type: "risk",
      status: "monitoring"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "milestone": return <Target className="h-4 w-4" />;
      case "team": return <Users className="h-4 w-4" />;
      case "budget": return <TrendingUp className="h-4 w-4" />;
      case "risk": return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "text-green-500";
      case "at-risk": return "text-orange-500";
      case "delayed": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Project Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Project planning, team coordination, and delivery oversight
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Project Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map((stat, index) => (
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
        {/* Active Projects */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Badge 
                    variant={project.status === "on-track" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.team} team members</span>
                  <span>{project.budget}</span>
                  <span>{project.deadline}</span>
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
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Team</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Budget Review</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Project Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Risks & Issues */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Project Risks & Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Data Migration - Technical Delay</p>
                  <p className="text-xs text-muted-foreground">Database migration taking longer than expected</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Mitigate</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Mobile App - Resource Constraint</p>
                  <p className="text-xs text-muted-foreground">Need additional iOS developer</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Resolve</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">E-commerce - Scope Creep</p>
                  <p className="text-xs text-muted-foreground">Client requesting additional features</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
