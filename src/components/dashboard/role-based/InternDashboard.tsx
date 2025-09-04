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
  Users
} from "lucide-react";

export const InternDashboard = () => {
  const internStats = [
    {
      title: "Learning Tasks",
      value: "5",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "2 completed this week",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Hours Logged",
      value: "24h",
      icon: <Clock className="h-4 w-4" />,
      change: "This week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Learning Progress",
      value: "78%",
      icon: <GraduationCap className="h-4 w-4" />,
      change: "+12% this month",
      color: "text-purple-500",
      trend: "up"
    },
    {
      title: "Mentor Sessions",
      value: "3",
      icon: <Users className="h-4 w-4" />,
      change: "This month",
      color: "text-orange-500",
      trend: "up"
    }
  ];

  const learningTasks = [
    { 
      title: "React fundamentals course", 
      status: "in-progress", 
      priority: "high", 
      dueDate: "Dec 25, 2024",
      progress: 80,
      type: "course"
    },
    { 
      title: "Code review with mentor", 
      status: "todo", 
      priority: "medium", 
      dueDate: "Dec 22, 2024",
      progress: 0,
      type: "mentorship"
    },
    { 
      title: "Bug fix assignment", 
      status: "completed", 
      priority: "high", 
      dueDate: "Dec 18, 2024",
      progress: 100,
      type: "practical"
    },
    { 
      title: "Documentation project", 
      status: "todo", 
      priority: "low", 
      dueDate: "Dec 30, 2024",
      progress: 0,
      type: "practical"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Learning task completed",
      details: "Bug fix assignment",
      timestamp: "1 day ago",
      type: "task",
      status: "completed"
    },
    {
      id: "2",
      action: "Mentor session",
      details: "Code review and feedback session",
      timestamp: "2 days ago",
      type: "mentorship",
      status: "completed"
    },
    {
      id: "3",
      action: "Learning progress updated",
      details: "React course - 80% complete",
      timestamp: "3 days ago",
      type: "learning",
      status: "completed"
    },
    {
      id: "4",
      action: "New assignment received",
      details: "Documentation project assigned",
      timestamp: "1 week ago",
      type: "assignment",
      status: "pending"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare className="h-4 w-4" />;
      case "mentorship": return <Users className="h-4 w-4" />;
      case "learning": return <GraduationCap className="h-4 w-4" />;
      case "assignment": return <BookOpen className="h-4 w-4" />;
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

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "course": return "bg-blue-500";
      case "mentorship": return "bg-purple-500";
      case "practical": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Intern Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Learning tasks, mentorship, and skill development
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Learning Report
          </Button>
          <Button size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Intern Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {internStats.map((stat, index) => (
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
        {/* Learning Tasks */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Learning Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningTasks.map((task, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <div className={`w-2 h-2 rounded-full ${getTaskTypeColor(task.type)}`}></div>
                    <Badge 
                      variant={task.status === "completed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                {task.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due: {task.dueDate}</span>
                  <span className="capitalize">{task.type}</span>
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
              <span className="text-sm">Log Time</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Mentor Session</span>
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

      {/* Learning Resources */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="font-semibold mb-2">React Fundamentals</h3>
              <p className="text-sm text-muted-foreground mb-3">Complete React course with hands-on projects</p>
              <Button size="sm" variant="outline">Continue Learning</Button>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h3 className="font-semibold mb-2">Git & Version Control</h3>
              <p className="text-sm text-muted-foreground mb-3">Learn Git workflows and best practices</p>
              <Button size="sm" variant="outline">Start Course</Button>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <h3 className="font-semibold mb-2">Code Review Best Practices</h3>
              <p className="text-sm text-muted-foreground mb-3">How to give and receive effective code reviews</p>
              <Button size="sm" variant="outline">Read Guide</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
