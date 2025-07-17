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
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  project?: {
    name: string;
  };
};

type Project = Database['public']['Tables']['projects']['Row'];

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export const TaskBoard = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", color: "bg-secondary", tasks: [] },
    { id: "in_progress", title: "In Progress", color: "bg-info", tasks: [] },
    { id: "review", title: "Review", color: "bg-warning", tasks: [] },
    { id: "done", title: "Done", color: "bg-success", tasks: [] }
  ]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  
  // Form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    project_id: "",
    assignee_id: "",
    estimated_hours: ""
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey (
          full_name,
          avatar_url
        ),
        project:projects (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    // Group tasks by status
    const tasksByStatus = (data || []).reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: tasksByStatus[col.id] || []
    })));
  };

  const fetchProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newTask.title || !newTask.project_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          project_id: newTask.project_id,
          assignee_id: newTask.assignee_id || null,
          reporter_id: user.id,
          estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : null,
          status: 'todo'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        project_id: "",
        assignee_id: "",
        estimated_hours: ""
      });
      setShowNewTask(false);
      
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus as any })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated",
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-warning";
      case "low": return "bg-success";
      case "urgent": return "bg-red-600";
      default: return "bg-secondary";
    }
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                  <Select value={newTask.project_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, project_id: value }))}>
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
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
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
                  value={newTask.estimated_hours}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: e.target.value }))}
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
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
                >
                  {isLoading ? "Creating..." : "Create Task"}
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
                        {formatTime(task.actual_hours ? task.actual_hours * 60 : 0)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.assignee ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-gradient-primary text-white">
                                {task.assignee.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {task.assignee.full_name || 'Unassigned'}
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