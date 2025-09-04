import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Building, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  role: string;
  department?: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  directReports?: OrgChartNode[];
  managerId?: string;
  level: number;
}

interface OrgChartProps {
  className?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ className }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'hierarchy' | 'grid'>('hierarchy');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Fetch users data
  const { data: usersData, isLoading } = useUsers({
    search: searchTerm || undefined,
    departmentId: selectedDepartment !== "all" ? selectedDepartment : undefined,
  });

  const users = usersData?.data?.data || [];

  // Build organizational hierarchy
  const orgHierarchy = useMemo(() => {
    const usersList = usersData?.data?.data || [];
    if (!usersList.length) return [];

    // Create a map of users by ID
    const userMap = new Map<string, OrgChartNode>();
    const rootNodes: OrgChartNode[] = [];

    // First pass: create all nodes
    usersList.forEach((user) => {
      const node: OrgChartNode = {
        id: user.id,
        name: user.fullName || user.email,
        position: user.position || 'No Position',
        role: user.role,
        department: user.departmentId,
        email: user.email,
        phone: user.phone,
        avatar: undefined,
        isActive: user.isActive,
        directReports: [],
        managerId: undefined, // This would come from the backend
        level: 0
      };
      userMap.set(user.id, node);
    });

    // Second pass: build hierarchy (simplified - in real app, you'd have manager relationships)
    // For now, we'll create a simple hierarchy based on roles
    const roleHierarchy = {
      'SUPER_ADMIN': 0,
      'ORG_ADMIN': 1,
      'DEPT_ADMIN': 2,
      'PROJECT_MANAGER': 3,
      'TEAM_LEAD': 4,
      'HR': 2,
      'EMPLOYEE': 5,
      'CONTRACTOR': 5,
      'INTERN': 6,
      'TRAINEE': 6
    };

    userMap.forEach((node) => {
      node.level = roleHierarchy[node.role as keyof typeof roleHierarchy] || 5;
    });

    // Sort by level and add to root nodes
    const sortedNodes = Array.from(userMap.values()).sort((a, b) => a.level - b.level);
    rootNodes.push(...sortedNodes);

    return rootNodes;
  }, [usersData]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-500';
      case 'ORG_ADMIN': return 'bg-orange-500';
      case 'DEPT_ADMIN': return 'bg-blue-500';
      case 'PROJECT_MANAGER': return 'bg-green-500';
      case 'TEAM_LEAD': return 'bg-purple-500';
      case 'HR': return 'bg-pink-500';
      case 'EMPLOYEE': return 'bg-gray-500';
      case 'CONTRACTOR': return 'bg-yellow-500';
      case 'INTERN': return 'bg-cyan-500';
      case 'TRAINEE': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: OrgChartNode, index: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id} className="relative">
        <Card 
          className={cn(
            "w-64 bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm hover:shadow-glass-md transition-all duration-300 cursor-pointer",
            isSelected && "ring-2 ring-primary",
            !node.isActive && "opacity-60"
          )}
          onClick={() => setSelectedNode(node.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={node.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {getInitials(node.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{node.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{node.position}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${getRoleColor(node.role)} text-white border-white/20 text-xs`}
                >
                  {node.role.replace('_', ' ')}
                </Badge>
                {!node.isActive && (
                  <Badge variant="outline" className="bg-destructive text-white border-white/20 text-xs">
                    INACTIVE
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="truncate">{node.email}</span>
                </div>
                {node.phone && (
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{node.phone}</span>
                  </div>
                )}
                {node.department && (
                  <div className="flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    <span>{node.department}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection line to next level */}
        {index < orgHierarchy.length - 1 && (
          <div className="flex justify-center my-4">
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent"></div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Organizational Chart
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual hierarchy and reporting relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: 'hierarchy' | 'grid') => setViewMode(value)}>
              <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                <SelectItem value="hierarchy">Hierarchy View</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end">
              <Badge variant="outline" className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                {orgHierarchy.length} employees
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizational Chart */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'hierarchy' ? (
            <div className="space-y-4">
              {orgHierarchy.map((node, index) => renderNode(node, index))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orgHierarchy.map((node) => (
                <div key={node.id}>
                  {renderNode(node, 0)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Employee Details */}
      {selectedNode && (
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Employee Details</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedEmployee = orgHierarchy.find(node => node.id === selectedNode);
              if (!selectedEmployee) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedEmployee.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg">
                          {getInitials(selectedEmployee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                        <p className="text-muted-foreground">{selectedEmployee.position}</p>
                        <Badge 
                          variant="outline" 
                          className={`${getRoleColor(selectedEmployee.role)} text-white border-white/20 mt-1`}
                        >
                          {selectedEmployee.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                      {selectedEmployee.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedEmployee.phone}</span>
                        </div>
                      )}
                      {selectedEmployee.department && (
                        <div className="flex items-center text-sm">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedEmployee.department}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Report
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Status</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedEmployee.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{selectedEmployee.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
