import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Clock, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks, useCreateTask, useUpdateTask } from "@/lib/hooks/use-api";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    fullName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  departmentId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export const TaskBoard = () => {
  const { user } = useAuth();
  const [showNewTask, setShowNewTask] = useState(false);
  
  // Form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    projectId: "",
    assigneeId: "",
    estimatedHours: ""
  });

  // Use TanStack Query hooks
  const { data: tasksData, isLoading: tasksLoading } = useTasks({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const createTaskMutation = useCreateTask({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      // Reset form
      setNewTask({
        title: "",
        description: "",
        priority: "MEDIUM" as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        projectId: "",
        assigneeId: "",
        estimatedHours: ""
      });
      setShowNewTask(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useUpdateTask({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const tasks = tasksData?.data?.data || [];
  const projects: Project[] = []; // TODO: Implement project fetching

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const columns: Column[] = [
    { id: "TODO", title: "To Do", color: "bg-secondary", tasks: tasksByStatus["TODO"] || [] },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-info", tasks: tasksByStatus["IN_PROGRESS"] || [] },
    { id: "REVIEW", title: "Review", color: "bg-warning", tasks: tasksByStatus["REVIEW"] || [] },
    { id: "DONE", title: "Done", color: "bg-success", tasks: tasksByStatus["DONE"] || [] }
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newTask.title || !newTask.projectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      projectId: newTask.projectId,
      assigneeId: newTask.assigneeId || undefined,
      estimatedHours: newTask.estimatedHours ? parseFloat(newTask.estimatedHours) : undefined,
      status: 'TODO'
    });
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-destructive";
      case "MEDIUM": return "bg-warning";
      case "LOW": return "bg-success";
      case "URGENT": return "bg-red-600";
      default: return "bg-secondary";
    }
  };

  const formatTime = (hours: number | null | undefined) => {
    if (!hours) return "0h 0m";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Task Board
          </h2>
          <p className="text-muted-foreground mt-1">Organize and track your team's progress</p>
        </div>
        
        <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your project board
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-project">Project</Label>
                  <Select value={newTask.projectId} onValueChange={(value) => setNewTask(prev => ({ ...prev, projectId: value }))}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-hours">Estimated Hours</Label>
                <Input
                  id="task-hours"
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewTask(false)}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color} shadow-glass-sm`} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="outline" className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {task.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-white/20 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
                          {columns.map((col) => (
                            <DropdownMenuItem 
                              key={col.id}
                              onClick={() => updateTaskStatus(task.id, col.id)}
                              className="hover:bg-white/20 transition-colors"
                            >
                              Move to {col.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(task.priority)} text-white border-white/20`}
                      >
                        {task.priority}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(task.actualHours)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.assignee ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-gradient-primary text-white">
                                {task.assignee.fullName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {task.assignee.fullName || 'Unassigned'}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </div>
                      {task.project && (
                        <span className="text-xs text-muted-foreground">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};