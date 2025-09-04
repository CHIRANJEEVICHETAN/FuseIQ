import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Activity,
  FileText,
  Plus,
  User,
  Plane,
  Receipt
} from "lucide-react";

export const EmployeeDashboard = () => {
  const employeeStats = [
    {
      title: "My Tasks",
      value: "8",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "3 completed today",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Time Tracked",
      value: "6.5h",
      icon: <Clock className="h-4 w-4" />,
      change: "Today's progress",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Leave Balance",
      value: "12 days",
      icon: <Plane className="h-4 w-4" />,
      change: "Annual leave remaining",
      color: "text-purple-500",
      trend: "stable"
    },
    {
      title: "Productivity",
      value: "94%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "+2% this week",
      color: "text-green-500",
      trend: "up"
    }
  ];

  const myTasks = [
    { 
      title: "Implement user authentication", 
      status: "in-progress", 
      priority: "high", 
      dueDate: "Dec 20, 2024",
      progress: 75
    },
    { 
      title: "Code review for API endpoints", 
      status: "todo", 
      priority: "medium", 
      dueDate: "Dec 22, 2024",
      progress: 0
    },
    { 
      title: "Update documentation", 
      status: "todo", 
      priority: "low", 
      dueDate: "Dec 25, 2024",
      progress: 0
    },
    { 
      title: "Bug fix - login issue", 
      status: "completed", 
      priority: "high", 
      dueDate: "Dec 18, 2024",
      progress: 100
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Task completed",
      details: "Bug fix - login issue",
      timestamp: "2 hours ago",
      type: "task",
      status: "completed"
    },
    {
      id: "2",
      action: "Time logged",
      details: "6.5 hours on authentication feature",
      timestamp: "4 hours ago",
      type: "time",
      status: "completed"
    },
    {
      id: "3",
      action: "Leave request submitted",
      details: "3 days vacation - Dec 25-27",
      timestamp: "1 day ago",
      type: "leave",
      status: "pending"
    },
    {
      id: "4",
      action: "Expense submitted",
      details: "$120 - Conference registration",
      timestamp: "2 days ago",
      type: "expense",
      status: "pending"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare className="h-4 w-4" />;
      case "time": return <Clock className="h-4 w-4" />;
      case "leave": return <Plane className="h-4 w-4" />;
      case "expense": return <Receipt className="h-4 w-4" />;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Personal workspace and task management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            My Reports
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employeeStats.map((stat, index) => (
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
        {/* My Tasks */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTasks.map((task, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
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
                <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
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
              <CheckSquare className="h-6 w-6" />
              <span className="text-sm">Log Time</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plane className="h-6 w-6" />
              <span className="text-sm">Request Leave</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Receipt className="h-6 w-6" />
              <span className="text-sm">Submit Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <User className="h-6 w-6" />
              <span className="text-sm">Update Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <Calendar className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Implement user authentication</p>
                <p className="text-xs text-muted-foreground">Due: Dec 20, 2024 (2 days)</p>
              </div>
              <Badge variant="destructive">High Priority</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Code review for API endpoints</p>
                <p className="text-xs text-muted-foreground">Due: Dec 22, 2024 (4 days)</p>
              </div>
              <Badge variant="secondary">Medium Priority</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Calendar className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Update documentation</p>
                <p className="text-xs text-muted-foreground">Due: Dec 25, 2024 (7 days)</p>
              </div>
              <Badge variant="outline">Low Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
