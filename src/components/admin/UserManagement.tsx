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
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];

export const UserManagement = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    if (user && profile) {
      fetchUsers();
      fetchDepartments();
    }
  }, [user, profile]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        departments (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return;
    }

    setDepartments(data || []);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDepartment = async (userId: string, departmentId: string | null) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ department_id: departmentId })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User department updated successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user department:', error);
      toast({
        title: "Error",
        description: "Failed to update user department",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-destructive';
      case 'org_admin': return 'bg-warning';
      case 'dept_admin': return 'bg-info';
      case 'project_manager': return 'bg-success';
      case 'team_lead': return 'bg-primary';
      case 'employee': return 'bg-secondary';
      case 'contractor': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  const canManageUser = (targetUser: Profile) => {
    if (!profile) return false;
    
    // Super admin can manage everyone
    if (profile.role === 'super_admin') return true;
    
    // Org admin can manage everyone except super admin
    if (profile.role === 'org_admin' && targetUser.role !== 'super_admin') return true;
    
    // Dept admin can manage users in their department (except admins)
    if (profile.role === 'dept_admin' && 
        targetUser.department_id === profile.department_id &&
        !['super_admin', 'org_admin'].includes(targetUser.role)) return true;
    
    return false;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || user.department_id === selectedDepartment;
    
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
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="org_admin">Org Admin</SelectItem>
                <SelectItem value="dept_admin">Dept Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
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
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {user.full_name || 'No name'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getRoleColor(user.role)} text-white border-white/20 text-xs`}
                        >
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {!user.is_active && (
                          <Badge variant="outline" className="bg-destructive text-white border-white/20 text-xs">
                            INACTIVE
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.employee_id && (
                          <div className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.employee_id}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {format(new Date(user.created_at), 'MMM yyyy')}
                        </div>
                      </div>
                      
                      {user.position && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {user.position}
                          {departments.find(d => d.id === user.department_id) && (
                            <span> • {departments.find(d => d.id === user.department_id)?.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canManageUser(user) && (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-40 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                          <SelectItem value="project_manager">Project Manager</SelectItem>
                          {(profile?.role === 'super_admin' || profile?.role === 'org_admin') && (
                            <SelectItem value="dept_admin">Dept Admin</SelectItem>
                          )}
                          {profile?.role === 'super_admin' && (
                            <>
                              <SelectItem value="org_admin">Org Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        value={user.department_id || "none"}
                        onValueChange={(value) => updateUserDepartment(user.id, value === "none" ? null : value)}
                        disabled={isLoading}
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
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        disabled={isLoading}
                        className={cn(
                          "bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20",
                          !user.is_active && "bg-destructive/20"
                        )}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
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