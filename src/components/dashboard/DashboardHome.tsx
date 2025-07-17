import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  Activity
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
          <h2 className="text-2xl font-bold">Good morning, John!</h2>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>
        <Badge variant="outline" className="text-sm">
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
          <Card key={index}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                      className={`${getPriorityColor(task.priority)} text-white text-xs`}
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

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Authentication System</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Task Management</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Time Tracking</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reporting Dashboard</span>
                <span className="text-sm text-muted-foreground">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};