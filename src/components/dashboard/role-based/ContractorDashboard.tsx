import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity,
  FileText,
  Plus,
  User,
  Calendar,
  Briefcase
} from "lucide-react";

export const ContractorDashboard = () => {
  const contractorStats = [
    {
      title: "Assigned Tasks",
      value: "6",
      icon: <CheckSquare className="h-4 w-4" />,
      change: "2 completed this week",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Hours Logged",
      value: "32h",
      icon: <Clock className="h-4 w-4" />,
      change: "This week",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Earnings",
      value: "$2,400",
      icon: <DollarSign className="h-4 w-4" />,
      change: "This month",
      color: "text-green-500",
      trend: "up"
    },
    {
      title: "Contract Status",
      value: "Active",
      icon: <Briefcase className="h-4 w-4" />,
      change: "Until Mar 2025",
      color: "text-blue-500",
      trend: "stable"
    }
  ];

  const assignedTasks = [
    { 
      title: "API documentation update", 
      status: "in-progress", 
      priority: "high", 
      dueDate: "Dec 22, 2024",
      progress: 60,
      hours: 8
    },
    { 
      title: "Database optimization", 
      status: "todo", 
      priority: "medium", 
      dueDate: "Dec 28, 2024",
      progress: 0,
      hours: 12
    },
    { 
      title: "Code review and testing", 
      status: "completed", 
      priority: "high", 
      dueDate: "Dec 18, 2024",
      progress: 100,
      hours: 6
    }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Task completed",
      details: "Code review and testing",
      timestamp: "1 day ago",
      type: "task",
      status: "completed"
    },
    {
      id: "2",
      action: "Hours logged",
      details: "6 hours on code review",
      timestamp: "1 day ago",
      type: "time",
      status: "completed"
    },
    {
      id: "3",
      action: "Invoice submitted",
      details: "December invoice - $2,400",
      timestamp: "3 days ago",
      type: "invoice",
      status: "pending"
    },
    {
      id: "4",
      action: "Contract extended",
      details: "Extended until March 2025",
      timestamp: "1 week ago",
      type: "contract",
      status: "completed"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare className="h-4 w-4" />;
      case "time": return <Clock className="h-4 w-4" />;
      case "invoice": return <DollarSign className="h-4 w-4" />;
      case "contract": return <Briefcase className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Contractor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Project tasks, time tracking, and contract management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            My Reports
          </Button>
          <Button size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Contractor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contractorStats.map((stat, index) => (
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
        {/* Assigned Tasks */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Assigned Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignedTasks.map((task, index) => (
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due: {task.dueDate}</span>
                  <span>{task.hours}h estimated</span>
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
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Submit Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">View Contract</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <User className="h-6 w-6" />
              <span className="text-sm">Update Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Contract Type</p>
              <p className="text-lg font-semibold">Fixed-term</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
              <p className="text-lg font-semibold">$75/hour</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p className="text-lg font-semibold">March 31, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
