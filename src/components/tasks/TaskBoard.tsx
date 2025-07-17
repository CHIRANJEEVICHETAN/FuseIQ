import { useState } from "react";
import { Plus, MoreHorizontal, Clock, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate: string;
  timeSpent: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-secondary",
    tasks: [
      {
        id: "1",
        title: "Design user authentication flow",
        description: "Create wireframes and mockups for login/signup",
        priority: "high",
        assignee: { name: "John Doe" },
        dueDate: "2024-01-15",
        timeSpent: 0
      },
      {
        id: "2",
        title: "Setup database schema",
        description: "Define tables and relationships",
        priority: "medium",
        assignee: { name: "Jane Smith" },
        dueDate: "2024-01-20",
        timeSpent: 0
      }
    ]
  },
  {
    id: "progress",
    title: "In Progress",
    color: "bg-info",
    tasks: [
      {
        id: "3",
        title: "Implement task board component",
        description: "Build drag-and-drop kanban interface",
        priority: "high",
        assignee: { name: "Mike Johnson" },
        dueDate: "2024-01-18",
        timeSpent: 240
      }
    ]
  },
  {
    id: "review",
    title: "Review",
    color: "bg-warning",
    tasks: [
      {
        id: "4",
        title: "Code review for API endpoints",
        description: "Review and test authentication endpoints",
        priority: "medium",
        assignee: { name: "Sarah Wilson" },
        dueDate: "2024-01-16",
        timeSpent: 60
      }
    ]
  },
  {
    id: "done",
    title: "Done",
    color: "bg-success",
    tasks: [
      {
        id: "5",
        title: "Project setup and configuration",
        description: "Initialize project with all dependencies",
        priority: "low",
        assignee: { name: "John Doe" },
        dueDate: "2024-01-10",
        timeSpent: 120
      }
    ]
  }
];

export const TaskBoard = () => {
  const [columns, setColumns] = useState(initialColumns);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-warning";
      case "low": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      description: "Task description",
      priority: "medium",
      assignee: { name: "Unassigned" },
      dueDate: new Date().toISOString().split('T')[0],
      timeSpent: 0
    };

    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));

    toast({
      title: "Task Created",
      description: "New task added successfully",
    });
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
        <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => addTask(column.id)}
                className="hover:bg-white/20 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
                          <DropdownMenuItem className="hover:bg-white/20 transition-colors">Edit</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/20 transition-colors">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(task.priority)} text-white border-white/20`}
                      >
                        {task.priority}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(task.timeSpent)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback className="text-xs bg-gradient-primary text-white">
                            {task.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {task.assignee.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
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