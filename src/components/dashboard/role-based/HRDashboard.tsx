import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Heart,
  GraduationCap,
  FileText,
  Target,
  AlertTriangle
} from "lucide-react";

export const HRDashboard = () => {
  const hrStats = [
    {
      title: "Total Employees",
      value: "1,247",
      icon: <Users className="h-4 w-4" />,
      change: "+23 this month",
      color: "text-blue-500",
      trend: "up"
    },
    {
      title: "Open Positions",
      value: "15",
      icon: <UserPlus className="h-4 w-4" />,
      change: "3 new this week",
      color: "text-orange-500",
      trend: "up"
    },
    {
      title: "Monthly Payroll",
      value: "$2.4M",
      icon: <DollarSign className="h-4 w-4" />,
      change: "Processed successfully",
      color: "text-green-500",
      trend: "completed"
    },
    {
      title: "Performance Reviews",
      value: "89%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "Due this month",
      color: "text-purple-500",
      trend: "in-progress"
    }
  ];

  const recruitmentPipeline = [
    { stage: "Applied", count: 45, color: "bg-blue-500" },
    { stage: "Screening", count: 23, color: "bg-yellow-500" },
    { stage: "Interview", count: 12, color: "bg-orange-500" },
    { stage: "Final Review", count: 5, color: "bg-purple-500" },
    { stage: "Offered", count: 3, color: "bg-green-500" }
  ];

  const recentActivities = [
    {
      id: "1",
      action: "New hire onboarded",
      details: "Sarah Chen - Software Engineer",
      timestamp: "1 hour ago",
      type: "onboarding",
      status: "completed"
    },
    {
      id: "2",
      action: "Payroll processed",
      details: "$2.4M distributed to 1,247 employees",
      timestamp: "3 hours ago",
      type: "payroll",
      status: "completed"
    },
    {
      id: "3",
      action: "Performance review scheduled",
      details: "Q4 reviews for Engineering team",
      timestamp: "1 day ago",
      type: "performance",
      status: "scheduled"
    },
    {
      id: "4",
      action: "Leave request approved",
      details: "John Smith - 5 days vacation",
      timestamp: "2 days ago",
      type: "leave",
      status: "completed"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "onboarding": return <UserPlus className="h-4 w-4" />;
      case "payroll": return <DollarSign className="h-4 w-4" />;
      case "performance": return <TrendingUp className="h-4 w-4" />;
      case "leave": return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Human Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Employee lifecycle management and HR operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            HR Report
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, index) => (
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
        {/* Recruitment Pipeline */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recruitment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recruitmentPipeline.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-sm font-medium">{stage.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stage.color}`}
                    style={{ width: `${(stage.count / 45) * 100}%` }}
                  ></div>
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
              Recent HR Activities
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

      {/* HR Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 w-fit mx-auto mb-4">
              <UserPlus className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Recruitment</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage job postings and candidate pipeline</p>
            <Button size="sm" className="w-full">Manage</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-green-500/10 text-green-500 w-fit mx-auto mb-4">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Performance</h3>
            <p className="text-sm text-muted-foreground mb-4">Track and manage employee performance</p>
            <Button size="sm" className="w-full">Manage</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 w-fit mx-auto mb-4">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Learning & Development</h3>
            <p className="text-sm text-muted-foreground mb-4">Employee training and development programs</p>
            <Button size="sm" className="w-full">Manage</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-pink-500/10 text-pink-500 w-fit mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Employee Wellness</h3>
            <p className="text-sm text-muted-foreground mb-4">Wellness programs and employee engagement</p>
            <Button size="sm" className="w-full">Manage</Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Leave Request - Mike Chen</p>
                  <p className="text-xs text-muted-foreground">3 days sick leave - Dec 18-20</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Approve</Button>
                <Button size="sm" variant="outline">Deny</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">New Hire Paperwork</p>
                  <p className="text-xs text-muted-foreground">Sarah Chen - Background check pending</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Performance Review Due</p>
                  <p className="text-xs text-muted-foreground">Engineering team - 15 reviews pending</p>
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
