export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEPT_ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE' | 'CONTRACTOR'
          department_id: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          phone: string | null
          position: string | null
          hire_date: string | null
          employee_id: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEPT_ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE' | 'CONTRACTOR'
          department_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          employee_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEPT_ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE' | 'CONTRACTOR'
          department_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          employee_id?: string | null
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string | null
          end_date: string | null
          budget: number | null
          department_id: string | null
          manager_id: string
          created_at: string
          updated_at: string
          github_repo_url: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          department_id?: string | null
          manager_id: string
          created_at?: string
          updated_at?: string
          github_repo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          department_id?: string | null
          manager_id?: string
          created_at?: string
          updated_at?: string
          github_repo_url?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          project_id: string
          assignee_id: string | null
          reporter_id: string
          parent_task_id: string | null
          estimated_hours: number | null
          actual_hours: number | null
          due_date: string | null
          created_at: string
          updated_at: string
          github_issue_number: number | null
          github_pr_number: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          project_id: string
          assignee_id?: string | null
          reporter_id: string
          parent_task_id?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          github_issue_number?: number | null
          github_pr_number?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          project_id?: string
          assignee_id?: string | null
          reporter_id?: string
          parent_task_id?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          github_issue_number?: number | null
          github_pr_number?: number | null
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          project_id: string | null
          description: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          is_billable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          project_id?: string | null
          description?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          is_billable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          project_id?: string | null
          description?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          is_billable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          date: string
          clock_in: string | null
          clock_out: string | null
          break_duration_minutes: number | null
          total_hours: number | null
          status: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home'
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          clock_in?: string | null
          clock_out?: string | null
          break_duration_minutes?: number | null
          total_hours?: number | null
          status?: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home'
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          clock_in?: string | null
          clock_out?: string | null
          break_duration_minutes?: number | null
          total_hours?: number | null
          status?: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home'
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          user_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'bereavement' | 'study' | 'unpaid'
          start_date: string
          end_date: string
          days_requested: number
          reason: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'bereavement' | 'study' | 'unpaid'
          start_date: string
          end_date: string
          days_requested: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          leave_type?: 'annual' | 'sick' | 'maternity' | 'paternity' | 'bereavement' | 'study' | 'unpaid'
          start_date?: string
          end_date?: string
          days_requested?: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category: 'travel' | 'meals' | 'accommodation' | 'office_supplies' | 'client_entertainment' | 'other'
          amount: number
          currency: string
          description: string
          expense_date: string
          receipt_url: string | null
          status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'travel' | 'meals' | 'accommodation' | 'office_supplies' | 'client_entertainment' | 'other'
          amount: number
          currency?: string
          description: string
          expense_date: string
          receipt_url?: string | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'travel' | 'meals' | 'accommodation' | 'office_supplies' | 'client_entertainment' | 'other'
          amount?: number
          currency?: string
          description?: string
          expense_date?: string
          receipt_url?: string | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}