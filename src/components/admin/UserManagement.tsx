import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserCog, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  Phone,
  Calendar,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useUpdateUser } from "@/lib/hooks/use-api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types for our Express backend
interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Use TanStack Query hooks
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    search: searchTerm || undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
    departmentId: selectedDepartment !== "all" ? selectedDepartment : undefined,
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const users = usersData?.data?.data || [];
  const departments: Department[] = []; // TODO: Implement department fetching

  const updateUserRole = async (userId: string, newRole: string) => {
    updateUserMutation.mutate({
      id: userId,
      data: { role: newRole }
    });
  };

  const updateUserDepartment = async (userId: string, departmentId: string | null) => {
    updateUserMutation.mutate({
      id: userId,
      data: { departmentId }
    });
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      data: { isActive: !isActive }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-destructive';
      case 'ORG_ADMIN': return 'bg-warning';
      case 'DEPT_ADMIN': return 'bg-info';
      case 'PROJECT_MANAGER': return 'bg-success';
      case 'TEAM_LEAD': return 'bg-primary';
      case 'EMPLOYEE': return 'bg-secondary';
      case 'CONTRACTOR': return 'bg-muted';
      case 'INTERN': return 'bg-cyan-500';
      case 'TRAINEE': return 'bg-pink-500';
      case 'HR': return 'bg-purple-500';
      default: return 'bg-secondary';
    }
  };

  const canManageUser = (targetUser: User) => {
    if (!user) return false;
    
    // Super admin can manage everyone
    if (user?.role === 'SUPER_ADMIN') return true;
    
    // Org admin can manage everyone except super admin
    if (user?.role === 'ORG_ADMIN' && targetUser.role !== 'SUPER_ADMIN') return true;
    
    // Dept admin can manage users in their department (except admins)
    if (user?.role === 'DEPT_ADMIN' && 
        targetUser.departmentId === user.departmentId &&
        !['SUPER_ADMIN', 'ORG_ADMIN'].includes(targetUser.role)) return true;
    
    return false;
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || userItem.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || userItem.departmentId === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                <SelectItem value="DEPT_ADMIN">Dept Admin</SelectItem>
                <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end">
              <Badge variant="outline" className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                {filteredUsers.length} users
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((userItem) => (
              <div key={userItem.id} className="p-4 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {userItem.fullName?.charAt(0) || userItem.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {userItem.fullName || 'No name'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getRoleColor(userItem.role)} text-white border-white/20 text-xs`}
                        >
                          {userItem.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {!userItem.isActive && (
                          <Badge variant="outline" className="bg-destructive text-white border-white/20 text-xs">
                            INACTIVE
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {userItem.email}
                        </div>
                        {userItem.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {userItem.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {format(new Date(userItem.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                      
                      {userItem.position && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {userItem.position}
                          {userItem.departmentId && (
                            <span> • {userItem.departmentId}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canManageUser(userItem) && (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={userItem.role}
                        onValueChange={(value) => updateUserRole(userItem.id, value)}
                        disabled={updateUserMutation.isPending}
                      >
                        <SelectTrigger className="w-40 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                          <SelectItem value="TRAINEE">Trainee</SelectItem>
                          <SelectItem value="INTERN">Intern</SelectItem>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                          <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <SelectItem value="DEPT_ADMIN">Dept Admin</SelectItem>
                          )}
                          {user?.role === 'SUPER_ADMIN' && (
                            <>
                              <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        value={userItem.departmentId || "none"}
                        onValueChange={(value) => updateUserDepartment(userItem.id, value === "none" ? null : value)}
                        disabled={updateUserMutation.isPending}
                      >
                        <SelectTrigger className="w-40 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                          <SelectItem value="none">No Department</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(userItem.id, userItem.isActive)}
                        disabled={updateUserMutation.isPending}
                        className={cn(
                          "bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20",
                          !userItem.isActive && "bg-destructive/20"
                        )}
                      >
                        {userItem.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No users found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};