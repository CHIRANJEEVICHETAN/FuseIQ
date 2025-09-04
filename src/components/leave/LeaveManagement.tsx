import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plane, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaveRequests, useCreateLeaveRequest } from "@/lib/hooks/use-api";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  approver?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export const LeaveManagement = () => {
  const { user } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
  
  // Form state
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  // Use TanStack Query hooks
  const { data: leaveRequestsData, isLoading: leaveRequestsLoading } = useLeaveRequests({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const createLeaveRequestMutation = useCreateLeaveRequest({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
      // Reset form
      setLeaveType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      setShowNewRequest(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });

  const leaveRequests = leaveRequestsData?.data?.data || [];

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !leaveType || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const daysRequested = differenceInDays(endDate, startDate) + 1;

    createLeaveRequestMutation.mutate({
      leaveType: leaveType as 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT' | 'STUDY' | 'UNPAID',
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      days: daysRequested,
      reason: reason || undefined,
      status: 'PENDING'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-destructive';
      case 'PENDING': return 'bg-warning';
      case 'CANCELLED': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-primary';
      case 'sick': return 'bg-destructive';
      case 'maternity': return 'bg-success';
      case 'paternity': return 'bg-info';
      case 'bereavement': return 'bg-secondary';
      case 'study': return 'bg-warning';
      case 'unpaid': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Leave Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage your leave requests and track balances</p>
        </div>
        <Button 
          onClick={() => setShowNewRequest(!showNewRequest)}
          className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { type: 'Annual Leave', balance: 20, used: 5, color: 'bg-primary' },
          { type: 'Sick Leave', balance: 10, used: 2, color: 'bg-destructive' },
          { type: 'Personal Leave', balance: 5, used: 1, color: 'bg-warning' },
          { type: 'Study Leave', balance: 3, used: 0, color: 'bg-info' }
        ].map((leave, index) => (
          <Card key={index} className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{leave.type}</p>
                  <p className="text-2xl font-bold">{leave.balance - leave.used}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.used} used of {leave.balance}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${leave.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Leave Request Form */}
      {showNewRequest && (
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="h-5 w-5 mr-2" />
              New Leave Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                      <SelectItem value="study">Study Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="text-sm text-muted-foreground">
                    {startDate && endDate ? (
                      `${differenceInDays(endDate, startDate) + 1} day(s)`
                    ) : (
                      'Select dates'
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gradient-glass backdrop-blur-glass-sm border-white/20",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gradient-glass backdrop-blur-glass border-white/20">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gradient-glass backdrop-blur-glass-sm border-white/20",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gradient-glass backdrop-blur-glass border-white/20">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewRequest(false)}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createLeaveRequestMutation.isPending}
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
                >
                  {createLeaveRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests History */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Leave Requests History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaveRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`${getLeaveTypeColor(request.leaveType)} text-white border-white/20 text-xs`}
                      >
                        {request.leaveType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(request.status)} text-white border-white/20 text-xs flex items-center`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.days} day(s) • Submitted {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </div>
                    {request.reason && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Reason: {request.reason}
                      </div>
                    )}
                    {request.rejectionReason && (
                      <div className="text-sm text-destructive mt-1">
                        Rejection reason: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {leaveRequests.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No leave requests found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};