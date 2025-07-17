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
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_duration_minutes: number | null;
  total_hours: number | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home';
  location: string | null;
  notes: string | null;
}

export const AttendanceTracker = () => {
  const { user } = useAuth();
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching attendance:', error);
      return;
    }

    setCurrentAttendance(data);
  };

  const fetchAttendanceHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching attendance history:', error);
      return;
    }

    setAttendanceHistory(data || []);
  };

  const handleClockIn = async () => {
    if (!user) return;

    setIsLoading(true);
    const now = new Date().toISOString();
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          user_id: user.id,
          date: today,
          clock_in: now,
          status: 'present',
          location: location || null,
          notes: notes || null
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAttendance(data);
      setLocation("");
      setNotes("");
      
      toast({
        title: "Clocked In",
        description: `Successfully clocked in at ${format(new Date(), 'HH:mm')}`,
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user || !currentAttendance) return;

    setIsLoading(true);
    const now = new Date().toISOString();
    
    // Calculate total hours
    const clockInTime = new Date(currentAttendance.clock_in!);
    const clockOutTime = new Date(now);
    const totalMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));
    const breakMinutes = currentAttendance.break_duration_minutes || 0;
    const totalHours = (totalMinutes - breakMinutes) / 60;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out: now,
          total_hours: totalHours,
          notes: notes || currentAttendance.notes
        })
        .eq('id', currentAttendance.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentAttendance(data);
      setNotes("");
      
      toast({
        title: "Clocked Out",
        description: `Successfully clocked out at ${format(new Date(), 'HH:mm')}. Total hours: ${totalHours.toFixed(2)}`,
      });

      fetchAttendanceHistory();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success';
      case 'late': return 'bg-warning';
      case 'absent': return 'bg-destructive';
      case 'half_day': return 'bg-info';
      case 'work_from_home': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return format(new Date(timeString), 'HH:mm');
  };

  const isCurrentlyClockedIn = currentAttendance?.clock_in && !currentAttendance?.clock_out;

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
                    {formatTime(currentAttendance.clock_in)}
                  </div>
                </div>
                <div className="bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Clock Out</div>
                  <div className="text-lg font-semibold text-destructive">
                    {formatTime(currentAttendance.clock_out)}
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
                  disabled={isLoading}
                  className="bg-success hover:bg-success/90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? "Clocking In..." : "Clock In"}
                </Button>
              ) : (
                <Button 
                  onClick={handleClockOut}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-destructive hover:bg-destructive/90 text-white border-white/20 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  {isLoading ? "Clocking Out..." : "Clock Out"}
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
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(record.status)} text-white border-white/20 text-xs`}
                        >
                          {record.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatTime(record.clock_in)} - {formatTime(record.clock_out)}
                        {record.total_hours && (
                          <span className="ml-2">
                            ({record.total_hours.toFixed(2)}h)
                          </span>
                        )}
                      </div>
                      {record.location && (
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {record.location}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {record.clock_in && record.clock_out ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : record.clock_in ? (
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