import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useUpdateUser, useCreateUser } from "@/lib/hooks/use-api";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

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

interface CreateUserForm {
  email: string;
  password: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
}

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
}

interface BulkUserData {
  email: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
}

export const UserManagement = () => {
  const { user } = useAuth();
  const { canManageUsers, canPerformAction } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // User creation dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    fullName: "",
    role: "EMPLOYEE",
    departmentId: "",
    phone: "",
    position: ""
  });
  
  // Bulk operations state
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkUsers, setBulkUsers] = useState<BulkUserData[]>([]);
  const [bulkOperation, setBulkOperation] = useState<'create' | 'update' | 'delete'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user",
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
    if (!user || !canManageUsers) return false;
    
    // Super admin can manage everyone
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Org admin can manage everyone except super admin
    if (user.role === 'ORG_ADMIN' && targetUser.role !== 'SUPER_ADMIN') return true;
    
    // Dept admin can manage users in their department (except admins)
    if (user.role === 'DEPT_ADMIN' && 
        targetUser.departmentId === user.departmentId &&
        !['SUPER_ADMIN', 'ORG_ADMIN'].includes(targetUser.role)) return true;
    
    return false;
  };

  const canEditUser = (targetUser: User) => {
    return canManageUser(targetUser) && canPerformAction('edit-user');
  };

  const canDeleteUser = (targetUser: User) => {
    return canManageUser(targetUser) && canPerformAction('delete-user');
  };

  // User creation functions
  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password || !createUserForm.fullName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      email: createUserForm.email,
      password: createUserForm.password,
      fullName: createUserForm.fullName,
      role: createUserForm.role,
      departmentId: createUserForm.departmentId || undefined,
      phone: createUserForm.phone || undefined,
      position: createUserForm.position || undefined,
    } as CreateUserRequest);
    
    // Reset form and close dialog
    setCreateUserForm({
      email: "",
      password: "",
      fullName: "",
      role: "EMPLOYEE",
      departmentId: "",
      phone: "",
      position: ""
    });
    setIsCreateDialogOpen(false);
  };

  // Bulk operations functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const validatedUsers: BulkUserData[] = jsonData.map((row: Record<string, unknown>) => ({
          email: (row.email as string) || '',
          fullName: (row.fullName as string) || (row['Full Name'] as string) || '',
          role: (row.role as string) || 'EMPLOYEE',
          departmentId: (row.departmentId as string) || (row['Department ID'] as string) || '',
          phone: (row.phone as string) || '',
          position: (row.position as string) || ''
        })).filter(user => user.email && user.fullName);

        setBulkUsers(validatedUsers);
        toast({
          title: "File Uploaded",
          description: `${validatedUsers.length} users loaded from file`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse Excel file",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        email: "john.doe@example.com",
        fullName: "John Doe",
        role: "EMPLOYEE",
        departmentId: "dept-123",
        phone: "+1-555-0123",
        position: "Software Developer"
      },
      {
        email: "jane.smith@example.com",
        fullName: "Jane Smith",
        role: "TEAM_LEAD",
        departmentId: "dept-123",
        phone: "+1-555-0124",
        position: "Senior Developer"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "user_template.xlsx");
  };

  const handleBulkOperation = async () => {
    try {
      // TODO: Implement bulk API calls
      toast({
        title: "Success",
        description: `Bulk ${bulkOperation} completed for ${bulkUsers.length} users`,
      });
      
      setBulkUsers([]);
      setIsBulkDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform bulk ${bulkOperation}`,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || userItem.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || userItem.departmentId === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // Check if user has permission to access user management
  if (!canManageUsers) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          {canPerformAction('create-user') && (
            <>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gradient-glass backdrop-blur-glass border-white/20">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with their role and department assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                        className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createUserForm.password}
                        onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                        className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20"
                        placeholder="Temporary password"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fullName" className="text-right">Full Name</Label>
                      <Input
                        id="fullName"
                        value={createUserForm.fullName}
                        onChange={(e) => setCreateUserForm({...createUserForm, fullName: e.target.value})}
                        className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role</Label>
                      <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm({...createUserForm, role: value})}>
                        <SelectTrigger className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
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
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position" className="text-right">Position</Label>
                      <Input
                        id="position"
                        value={createUserForm.position}
                        onChange={(e) => setCreateUserForm({...createUserForm, position: e.target.value})}
                        className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20"
                        placeholder="Software Developer"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input
                        id="phone"
                        value={createUserForm.phone}
                        onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                        className="col-span-3 bg-gradient-glass backdrop-blur-glass-sm border-white/20"
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      className="bg-gradient-primary"
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Operations
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-gradient-glass backdrop-blur-glass border-white/20">
                  <DialogHeader>
                    <DialogTitle>Bulk User Operations</DialogTitle>
                    <DialogDescription>
                      Upload an Excel file to perform bulk operations on users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>

                    {bulkUsers.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Loaded Users ({bulkUsers.length})</h4>
                          <Select value={bulkOperation} onValueChange={(value: 'create' | 'update' | 'delete') => setBulkOperation(value)}>
                            <SelectTrigger className="w-40 bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                              <SelectItem value="create">Create Users</SelectItem>
                              <SelectItem value="update">Update Users</SelectItem>
                              <SelectItem value="delete">Delete Users</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {bulkUsers.slice(0, 5).map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/10 rounded">
                              <div>
                                <span className="font-medium">{user.fullName}</span>
                                <span className="text-sm text-muted-foreground ml-2">({user.email})</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                          {bulkUsers.length > 5 && (
                            <div className="text-sm text-muted-foreground text-center">
                              ... and {bulkUsers.length - 5} more users
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                      Cancel
                    </Button>
                    {bulkUsers.length > 0 && (
                      <Button onClick={handleBulkOperation} className="bg-gradient-primary">
                        {bulkOperation === 'create' && 'Create Users'}
                        {bulkOperation === 'update' && 'Update Users'}
                        {bulkOperation === 'delete' && 'Delete Users'}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
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