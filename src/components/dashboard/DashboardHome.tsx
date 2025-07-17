import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  Activity,
  Sparkles,
  Target
} from "lucide-react";

export const DashboardHome = () => {
  const stats = [
    {
      title: "Active Tasks",
      value: "12",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "+2 from yesterday",
      color: "text-primary"
    },
    {
      title: "Time Tracked",
      value: "6.5h",
      icon: <Clock className="h-4 w-4" />,
      change: "Today's progress",
      color: "text-success"
    },
    {
      title: "Team Members",
      value: "8",
      icon: <Users className="h-4 w-4" />,
      change: "Online now",
      color: "text-info"
    },
    {
      title: "Productivity",
      value: "94%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "+5% from last week",
      color: "text-success"
    }
  ];

  const recentTasks = [
    {
      id: "1",
      title: "Design user authentication flow",
      status: "in-progress",
      priority: "high",
      dueDate: "Today"
    },
    {
      id: "2",
      title: "Setup database schema",
      status: "todo",
      priority: "medium",
      dueDate: "Tomorrow"
    },
    {
      id: "3",
      title: "Code review for API endpoints",
      status: "review",
      priority: "medium",
      dueDate: "Dec 16"
    },
    {
      id: "4",
      title: "Implement task board component",
      status: "in-progress",
      priority: "high",
      dueDate: "Dec 18"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-secondary";
      case "in-progress": return "bg-info";
      case "review": return "bg-warning";
      case "done": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-warning";
      case "low": return "bg-success";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Good morning, John!
          </h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your projects today.</p>
        </div>
        <Badge variant="outline" className="text-sm bg-gradient-glass backdrop-blur-glass-sm border-white/20">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(task.priority)} text-white text-xs border-white/20`}
                    >
                      {task.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Authentication System</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Task Management</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Time Tracking</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reporting Dashboard</span>
                <span className="text-sm text-muted-foreground">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <CheckSquare className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium">Create Task</h3>
              <p className="text-sm text-muted-foreground">Add a new task to your board</p>
            </div>
            <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <Clock className="h-6 w-6 text-success mb-2" />
              <h3 className="font-medium">Start Timer</h3>
              <p className="text-sm text-muted-foreground">Begin tracking time</p>
            </div>
            <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <Users className="h-6 w-6 text-info mb-2" />
              <h3 className="font-medium">Invite Team</h3>
              <p className="text-sm text-muted-foreground">Add team members</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};