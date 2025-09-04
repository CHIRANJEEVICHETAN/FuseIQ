import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Timer,
  Sparkles,
  Play,
  Square
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCheckIn, useCheckOut } from "@/lib/hooks/use-api";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  userId: string;
  checkIn: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export const AttendanceTracker = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use TanStack Query hooks
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const checkInMutation = useCheckIn({
    onSuccess: () => {
      toast({
        title: "Clocked In",
        description: `Successfully clocked in at ${format(new Date(), 'HH:mm')}`,
      });
      setLocation("");
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useCheckOut({
    onSuccess: () => {
      toast({
        title: "Clocked Out",
        description: `Successfully clocked out at ${format(new Date(), 'HH:mm')}`,
      });
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const attendanceHistory = attendanceData?.data?.data || [];
  const currentAttendance = attendanceHistory.find(record => 
    format(new Date(record.checkIn), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || null;

  const handleClockIn = async () => {
    if (!user) return;

    checkInMutation.mutate({
      location: location || undefined,
      notes: notes || undefined
    });
  };

  const handleClockOut = async () => {
    if (!user || !currentAttendance) return;

    checkOutMutation.mutate({
      notes: notes || undefined
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-success';
      case 'LATE': return 'bg-warning';
      case 'ABSENT': return 'bg-destructive';
      case 'HALF_DAY': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '--:--';
    return format(new Date(timeString), 'HH:mm');
  };

  const isCurrentlyClockedIn = currentAttendance?.checkIn && !currentAttendance?.checkOut;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Attendance Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track your daily attendance and working hours</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
          <Sparkles className="h-4 w-4 mr-2" />
          {format(currentTime, 'HH:mm:ss')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock In/Out Card */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-4xl font-mono font-bold bg-gradient-primary bg-clip-text text-transparent">
                {format(currentTime, 'HH:mm:ss')}
              </div>
            </div>

            {currentAttendance && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Clock In</div>
                  <div className="text-lg font-semibold text-success">
                    {formatTime(currentAttendance.checkIn)}
                  </div>
                </div>
                <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Clock Out</div>
                  <div className="text-lg font-semibold text-destructive">
                    {formatTime(currentAttendance.checkOut)}
                  </div>
                </div>
              </div>
            )}

            {!isCurrentlyClockedIn && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">Location (optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Office, Home, Client site..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about your work day..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            <div className="flex justify-center">
              {!isCurrentlyClockedIn ? (
                <Button 
                  onClick={handleClockIn}
                  disabled={checkInMutation.isPending}
                  className="bg-success hover:bg-success/90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {checkInMutation.isPending ? "Clocking In..." : "Clock In"}
                </Button>
              ) : (
                <Button 
                  onClick={handleClockOut}
                  disabled={checkOutMutation.isPending}
                  variant="outline"
                  className="bg-destructive hover:bg-destructive/90 text-white border-white/20 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  {checkOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
                </Button>
              )}
            </div>

            {isCurrentlyClockedIn && (
              <div className="text-center">
                <Badge className="bg-success text-white animate-pulse">
                  Currently Clocked In
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceHistory.map((record) => (
                <div key={record.id} className="p-3 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {format(new Date(record.checkIn), 'MMM d, yyyy')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(record.status)} text-white border-white/20 text-xs`}
                        >
                          {record.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatTime(record.checkIn)} - {formatTime(record.checkOut)}
                        {record.totalHours && (
                          <span className="ml-2">
                            ({record.totalHours.toFixed(2)}h)
                          </span>
                        )}
                      </div>
                      {record.notes && (
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {record.checkIn && record.checkOut ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : record.checkIn ? (
                        <Clock className="h-5 w-5 text-warning" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {attendanceHistory.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No attendance records found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};