import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Clock, 
  GraduationCap, 
  TrendingUp, 
  Activity,
  FileText,
  Plus,
  User,
  Calendar,
  BookOpen,
  Users,
  Target
} from "lucide-react";

export const TraineeDashboard = () => {
  const traineeStats = [
    {
      title: "Training Modules",
      value: "8",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "3 completed this week",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Study Hours",
      value: "20h",
      icon: <Clock className="h-4 w-4" />,
      change: "This week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Learning Progress",
      value: "65%",
      icon: <GraduationCap className="h-4 w-4" />,
      change: "+15% this month",
      color: "text-purple-500",
      trend: "up"
    },
    {
      title: "Mentor Check-ins",
      value: "2",
      icon: <Users className="h-4 w-4" />,
      change: "This month",
      color: "text-orange-500",
      trend: "up"
    }
  ];

  const trainingModules = [
    { 
      title: "Introduction to Programming", 
      status: "completed", 
      priority: "high", 
      dueDate: "Dec 15, 2024",
      progress: 100,
      type: "foundation"
    },
    { 
      title: "HTML & CSS Basics", 
      status: "in-progress", 
      priority: "high", 
      dueDate: "Dec 22, 2024",
      progress: 70,
      type: "foundation"
    },
    { 
      title: "JavaScript Fundamentals", 
      status: "todo", 
      priority: "medium", 
      dueDate: "Dec 28, 2024",
      progress: 0,
      type: "programming"
    },
    { 
      title: "Team Collaboration", 
      status: "todo", 
      priority: "low", 
      dueDate: "Jan 5, 2025",
      progress: 0,
      type: "soft-skills"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Training module completed",
      details: "Introduction to Programming",
      timestamp: "2 days ago",
      type: "training",
      status: "completed"
    },
    {
      id: "2",
      action: "Mentor check-in",
      details: "Weekly progress review with Sarah",
      timestamp: "3 days ago",
      type: "mentorship",
      status: "completed"
    },
    {
      id: "3",
      action: "Learning progress updated",
      details: "HTML & CSS - 70% complete",
      timestamp: "4 days ago",
      type: "learning",
      status: "completed"
    },
    {
      id: "4",
      action: "New module assigned",
      details: "JavaScript Fundamentals",
      timestamp: "1 week ago",
      type: "assignment",
      status: "pending"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "training": return <GraduationCap className="h-4 w-4" />;
      case "mentorship": return <Users className="h-4 w-4" />;
      case "learning": return <BookOpen className="h-4 w-4" />;
      case "assignment": return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500";
      case "in-progress": return "text-blue-500";
      case "todo": return "text-gray-500";
      case "pending": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case "foundation": return "bg-blue-500";
      case "programming": return "bg-green-500";
      case "soft-skills": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Trainee Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Training modules, learning progress, and skill development
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Progress Report
          </Button>
          <Button size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Log Study Time
          </Button>
        </div>
      </div>

      {/* Trainee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {traineeStats.map((stat, index) => (
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
        {/* Training Modules */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainingModules.map((module, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{module.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(module.priority)}`}></div>
                    <div className={`w-2 h-2 rounded-full ${getModuleTypeColor(module.type)}`}></div>
                    <Badge 
                      variant={module.status === "completed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {module.status}
                    </Badge>
                  </div>
                </div>
                {module.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due: {module.dueDate}</span>
                  <span className="capitalize">{module.type.replace('-', ' ')}</span>
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
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-sm">Log Study Time</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Mentor Check-in</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Learning Resources</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <User className="h-6 w-6" />
              <span className="text-sm">Update Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Introduction to Programming</h3>
                <p className="text-sm text-muted-foreground">Basic programming concepts and logic</p>
              </div>
              <Badge variant="default">Completed</Badge>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">HTML & CSS Basics</h3>
                <p className="text-sm text-muted-foreground">Web development fundamentals</p>
              </div>
              <Badge variant="secondary">In Progress</Badge>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">JavaScript Fundamentals</h3>
                <p className="text-sm text-muted-foreground">Programming with JavaScript</p>
              </div>
              <Badge variant="outline">Not Started</Badge>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">Working effectively in teams</p>
              </div>
              <Badge variant="outline">Not Started</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
