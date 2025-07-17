import { useState, useEffect } from "react";
import { Play, Pause, Square, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  taskName: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  date: string;
}

export const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      taskName: "Design user authentication flow",
      description: "Working on wireframes and mockups",
      duration: 120,
      startTime: "09:00",
      endTime: "11:00",
      date: "2024-01-15"
    },
    {
      id: "2",
      taskName: "Code review",
      description: "Reviewing API endpoints",
      duration: 45,
      startTime: "14:00",
      endTime: "14:45",
      date: "2024-01-15"
    }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStart = () => {
    if (!taskName.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task name before starting the timer",
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    toast({
      title: "Timer Started",
      description: `Started tracking time for "${taskName}"`,
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    toast({
      title: "Timer Paused",
      description: "Time tracking paused",
    });
  };

  const handleStop = () => {
    if (currentTime > 0) {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        taskName,
        description,
        duration: Math.floor(currentTime / 60),
        startTime: new Date(Date.now() - currentTime * 1000).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        endTime: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date().toISOString().split('T')[0]
      };

      setTimeEntries(prev => [newEntry, ...prev]);
      setCurrentTime(0);
      setTaskName("");
      setDescription("");
      
      toast({
        title: "Time Entry Saved",
        description: `Logged ${formatDuration(newEntry.duration)} for "${newEntry.taskName}"`,
      });
    }
    setIsRunning(false);
  };

  const getTotalTimeToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeEntries
      .filter(entry => entry.date === today)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Time Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track your productivity and focus</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
          <Sparkles className="h-4 w-4 mr-2" />
          Today: {formatDuration(getTotalTimeToday())}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              Current Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-mono font-bold bg-gradient-primary bg-clip-text text-transparent">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {isRunning ? (
                  <Badge className="bg-success text-white animate-pulse">
                    Running...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                    Stopped
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="task-name" className="text-sm font-medium">Task Name</Label>
                <Input
                  id="task-name"
                  placeholder="What are you working on?"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about your work..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              {!isRunning ? (
                <Button 
                  onClick={handleStart} 
                  className="bg-success hover:bg-success/90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={handlePause} 
                  variant="outline"
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button 
                onClick={handleStop} 
                variant="outline"
                className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="p-3 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{entry.taskName}</h4>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.startTime} - {entry.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                        {formatDuration(entry.duration)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};