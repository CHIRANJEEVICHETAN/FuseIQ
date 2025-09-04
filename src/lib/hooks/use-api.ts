import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api, queryKeys, handleApiError, QueryParams, ApiResponse, PaginatedResponse } from '../api-client';
import { User } from '../api';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export const useCurrentUser = (options?: UseQueryOptions<ApiResponse<User>>) => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => api.get<User>('/auth/me'),
    ...options,
  });
};

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

export const useUsers = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<User>>>) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      console.log('useUsers - Making API call with params:', params);
      const response = await api.get<PaginatedResponse<User>>('/users', { params });
      console.log('useUsers - API response:', response);
      return response;
    },
    ...options,
  });
};

export const useOrgChartUsers = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<User>>>) => {
  return useQuery({
    queryKey: [...queryKeys.users.all, 'org-chart', params],
    queryFn: async () => {
      console.log('useOrgChartUsers - Making API call with params:', params);
      const response = await api.get<PaginatedResponse<User>>('/users/org-chart', { params });
      console.log('useOrgChartUsers - API response:', response);
      return response;
    },
    ...options,
  });
};

export const useUser = (id: string, options?: UseQueryOptions<ApiResponse<User>>) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: !!id,
    ...options,
  });
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  departmentId?: string;
  phone?: string;
  position?: string;
}

export const useCreateUser = (options?: UseMutationOptions<ApiResponse<User>, Error, CreateUserRequest>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<User>('/users', data),
    onSuccess: () => {
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      console.error('Create user error:', handleApiError(error));
    },
    ...options,
  });
};

export const useUpdateUser = (options?: UseMutationOptions<ApiResponse<User>, Error, { id: string; data: Partial<User> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put<User>(`/users/${id}`, data),
    onSuccess: (response, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), response);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Update current user if it's the same user
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    onError: (error) => {
      console.error('Update user error:', handleApiError(error));
    },
    ...options,
  });
};

// ============================================================================
// TASK MANAGEMENT HOOKS
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  parentTaskId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  reporter?: User;
  project?: {
    id: string;
    name: string;
  };
}

export const useTasks = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<Task>>>) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => api.get<PaginatedResponse<Task>>('/tasks', { params }),
    ...options,
  });
};

export const useTask = (id: string, options?: UseQueryOptions<ApiResponse<Task>>) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useCreateTask = (options?: UseMutationOptions<ApiResponse<Task>, Error, Partial<Task>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<Task>('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
    onError: (error) => {
      console.error('Create task error:', handleApiError(error));
    },
    ...options,
  });
};

export const useUpdateTask = (options?: UseMutationOptions<ApiResponse<Task>, Error, { id: string; data: Partial<Task> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put<Task>(`/tasks/${id}`, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.tasks.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
    onError: (error) => {
      console.error('Update task error:', handleApiError(error));
    },
    ...options,
  });
};

export const useDeleteTask = (options?: UseMutationOptions<ApiResponse<void>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete<void>(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
    onError: (error) => {
      console.error('Delete task error:', handleApiError(error));
    },
    ...options,
  });
};

export const useTaskStats = (options?: UseQueryOptions<ApiResponse<unknown>>) => {
  return useQuery({
    queryKey: queryKeys.tasks.stats,
    queryFn: () => api.get('/tasks/stats'),
    ...options,
  });
};

// ============================================================================
// PROJECT MANAGEMENT HOOKS
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  departmentId: string;
  managerId: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  manager?: User;
  department?: {
    id: string;
    name: string;
  };
}

export const useProjects = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<Project>>>) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => api.get<PaginatedResponse<Project>>('/projects', { params }),
    ...options,
  });
};

export const useProject = (id: string, options?: UseQueryOptions<ApiResponse<Project>>) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useCreateProject = (options?: UseMutationOptions<ApiResponse<Project>, Error, Partial<Project>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (error) => {
      console.error('Create project error:', handleApiError(error));
    },
    ...options,
  });
};

export const useUpdateProject = (options?: UseMutationOptions<ApiResponse<Project>, Error, { id: string; data: Partial<Project> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put<Project>(`/projects/${id}`, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.projects.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (error) => {
      console.error('Update project error:', handleApiError(error));
    },
    ...options,
  });
};

export const useDeleteProject = (options?: UseMutationOptions<ApiResponse<void>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (error) => {
      console.error('Delete project error:', handleApiError(error));
    },
    ...options,
  });
};

export const useProjectTasks = (projectId: string, params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<Task>>>) => {
  return useQuery({
    queryKey: queryKeys.projects.tasks(projectId),
    queryFn: () => api.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, { params }),
    enabled: !!projectId,
    ...options,
  });
};

export const useProjectStats = (options?: UseQueryOptions<ApiResponse<unknown>>) => {
  return useQuery({
    queryKey: queryKeys.projects.stats,
    queryFn: () => api.get('/projects/stats'),
    ...options,
  });
};

// ============================================================================
// ATTENDANCE TRACKING HOOKS
// ============================================================================

export interface Attendance {
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
  user?: User;
}

export const useAttendance = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<Attendance>>>) => {
  return useQuery({
    queryKey: queryKeys.attendance.list(params),
    queryFn: () => api.get<PaginatedResponse<Attendance>>('/attendance', { params }),
    ...options,
  });
};

export const useAttendanceRecord = (id: string, options?: UseQueryOptions<ApiResponse<Attendance>>) => {
  return useQuery({
    queryKey: queryKeys.attendance.detail(id),
    queryFn: () => api.get<Attendance>(`/attendance/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useCheckIn = (options?: UseMutationOptions<ApiResponse<Attendance>, Error, { location?: string; notes?: string }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<Attendance>('/attendance/check-in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });
    },
    onError: (error) => {
      console.error('Check in error:', handleApiError(error));
    },
    ...options,
  });
};

export const useCheckOut = (options?: UseMutationOptions<ApiResponse<Attendance>, Error, { notes?: string }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<Attendance>('/attendance/check-out', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });
    },
    onError: (error) => {
      console.error('Check out error:', handleApiError(error));
    },
    ...options,
  });
};

export const useAttendanceStats = (options?: UseQueryOptions<ApiResponse<unknown>>) => {
  return useQuery({
    queryKey: queryKeys.attendance.stats,
    queryFn: () => api.get('/attendance/stats'),
    ...options,
  });
};

// ============================================================================
// LEAVE MANAGEMENT HOOKS
// ============================================================================

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT' | 'STUDY' | 'UNPAID';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  approver?: User;
}

export const useLeaveRequests = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<LeaveRequest>>>) => {
  return useQuery({
    queryKey: queryKeys.leave.list(params),
    queryFn: () => api.get<PaginatedResponse<LeaveRequest>>('/leave', { params }),
    ...options,
  });
};

export const useLeaveRequest = (id: string, options?: UseQueryOptions<ApiResponse<LeaveRequest>>) => {
  return useQuery({
    queryKey: queryKeys.leave.detail(id),
    queryFn: () => api.get<LeaveRequest>(`/leave/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useCreateLeaveRequest = (options?: UseMutationOptions<ApiResponse<LeaveRequest>, Error, Partial<LeaveRequest>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<LeaveRequest>('/leave', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance });
    },
    onError: (error) => {
      console.error('Create leave request error:', handleApiError(error));
    },
    ...options,
  });
};

export const useUpdateLeaveRequest = (options?: UseMutationOptions<ApiResponse<LeaveRequest>, Error, { id: string; data: Partial<LeaveRequest> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put<LeaveRequest>(`/leave/${id}`, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.leave.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.lists() });
    },
    onError: (error) => {
      console.error('Update leave request error:', handleApiError(error));
    },
    ...options,
  });
};

export const useDeleteLeaveRequest = (options?: UseMutationOptions<ApiResponse<void>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete<void>(`/leave/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance });
    },
    onError: (error) => {
      console.error('Delete leave request error:', handleApiError(error));
    },
    ...options,
  });
};

export const useLeaveBalance = (options?: UseQueryOptions<ApiResponse<unknown>>) => {
  return useQuery({
    queryKey: queryKeys.leave.balance,
    queryFn: () => api.get('/leave/balance'),
    ...options,
  });
};

export const usePendingLeaveRequests = (options?: UseQueryOptions<ApiResponse<LeaveRequest[]>>) => {
  return useQuery({
    queryKey: queryKeys.leave.pending,
    queryFn: () => api.get<LeaveRequest[]>('/leave/pending'),
    ...options,
  });
};

export const useApproveLeaveRequest = (options?: UseMutationOptions<ApiResponse<LeaveRequest>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post<LeaveRequest>(`/leave/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.pending });
    },
    onError: (error) => {
      console.error('Approve leave request error:', handleApiError(error));
    },
    ...options,
  });
};

export const useRejectLeaveRequest = (options?: UseMutationOptions<ApiResponse<LeaveRequest>, Error, { id: string; rejectionReason: string }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }) => api.post<LeaveRequest>(`/leave/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.pending });
    },
    onError: (error) => {
      console.error('Reject leave request error:', handleApiError(error));
    },
    ...options,
  });
};

// ============================================================================
// EXPENSE MANAGEMENT HOOKS
// ============================================================================

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  approverId?: string;
  rejectionReason?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  approver?: User;
  project?: {
    id: string;
    name: string;
  };
}

export const useExpenses = (params: QueryParams = {}, options?: UseQueryOptions<ApiResponse<PaginatedResponse<Expense>>>) => {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => api.get<PaginatedResponse<Expense>>('/expenses', { params }),
    ...options,
  });
};

export const useExpense = (id: string, options?: UseQueryOptions<ApiResponse<Expense>>) => {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => api.get<Expense>(`/expenses/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useCreateExpense = (options?: UseMutationOptions<ApiResponse<Expense>, Error, Partial<Expense>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post<Expense>('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
    },
    onError: (error) => {
      console.error('Create expense error:', handleApiError(error));
    },
    ...options,
  });
};

export const useUpdateExpense = (options?: UseMutationOptions<ApiResponse<Expense>, Error, { id: string; data: Partial<Expense> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put<Expense>(`/expenses/${id}`, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.expenses.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
    },
    onError: (error) => {
      console.error('Update expense error:', handleApiError(error));
    },
    ...options,
  });
};

export const useDeleteExpense = (options?: UseMutationOptions<ApiResponse<void>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete<void>(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
    },
    onError: (error) => {
      console.error('Delete expense error:', handleApiError(error));
    },
    ...options,
  });
};

export const useExpenseStats = (options?: UseQueryOptions<ApiResponse<unknown>>) => {
  return useQuery({
    queryKey: queryKeys.expenses.stats,
    queryFn: () => api.get('/expenses/stats'),
    ...options,
  });
};

export const usePendingExpenses = (options?: UseQueryOptions<ApiResponse<Expense[]>>) => {
  return useQuery({
    queryKey: queryKeys.expenses.pending,
    queryFn: () => api.get<Expense[]>('/expenses/pending'),
    ...options,
  });
};

export const useApproveExpense = (options?: UseMutationOptions<ApiResponse<Expense>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post<Expense>(`/expenses/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pending });
    },
    onError: (error) => {
      console.error('Approve expense error:', handleApiError(error));
    },
    ...options,
  });
};

export const useRejectExpense = (options?: UseMutationOptions<ApiResponse<Expense>, Error, { id: string; rejectionReason: string }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }) => api.post<Expense>(`/expenses/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pending });
    },
    onError: (error) => {
      console.error('Reject expense error:', handleApiError(error));
    },
    ...options,
  });
};

export const useReimburseExpense = (options?: UseMutationOptions<ApiResponse<Expense>, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post<Expense>(`/expenses/${id}/reimburse`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
    },
    onError: (error) => {
      console.error('Reimburse expense error:', handleApiError(error));
    },
    ...options,
  });
};
