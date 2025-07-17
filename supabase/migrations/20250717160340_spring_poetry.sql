/*
  # Initial Database Schema for Project Management System

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `departments` - Organization departments
    - `projects` - Project management
    - `tasks` - Task management with hierarchy
    - `time_entries` - Time tracking
    - `attendance` - Employee attendance tracking
    - `leave_requests` - Leave management system
    - `expenses` - Expense management system

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure user data access

  3. Indexes
    - Performance indexes for common queries
    - Foreign key indexes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'dept_admin', 'project_manager', 'team_lead', 'employee', 'contractor');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'work_from_home');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'maternity', 'paternity', 'bereavement', 'study', 'unpaid');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE expense_category AS ENUM ('travel', 'meals', 'accommodation', 'office_supplies', 'client_entertainment', 'other');
CREATE TYPE expense_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'reimbursed');

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'employee',
  department_id UUID REFERENCES departments(id),
  phone VARCHAR(20),
  position VARCHAR(255),
  hire_date DATE,
  employee_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'planning',
  priority priority_level DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES auth.users(id) NOT NULL,
  github_repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority priority_level DEFAULT 'medium',
  project_id UUID REFERENCES projects(id) NOT NULL,
  assignee_id UUID REFERENCES auth.users(id),
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_task_id UUID REFERENCES tasks(id),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  due_date TIMESTAMPTZ,
  github_issue_number INTEGER,
  github_pr_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  task_id UUID REFERENCES tasks(id),
  project_id UUID REFERENCES projects(id),
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  is_billable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(4,2),
  status attendance_status DEFAULT 'present',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category expense_category NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  status expense_status DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'dept_admin')
    )
  );

CREATE POLICY "Admins can manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin')
    )
  );

-- Departments policies
CREATE POLICY "Users can view departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin')
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects in their department" ON projects
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM profiles WHERE id = auth.uid()
    ) OR
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin')
    )
  );

CREATE POLICY "Project managers can manage their projects" ON projects
  FOR ALL USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'project_manager')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in accessible projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE department_id IN (
        SELECT department_id FROM profiles WHERE id = auth.uid()
      ) OR manager_id = auth.uid()
    ) OR
    assignee_id = auth.uid() OR
    reporter_id = auth.uid()
  );

CREATE POLICY "Users can manage tasks they're involved in" ON tasks
  FOR ALL USING (
    assignee_id = auth.uid() OR
    reporter_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE manager_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'project_manager')
    )
  );

-- Time entries policies
CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Managers can view team time entries" ON time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'project_manager', 'team_lead')
    )
  );

-- Attendance policies
CREATE POLICY "Users can manage own attendance" ON attendance
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Managers can view team attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'dept_admin', 'team_lead')
    )
  );

-- Leave requests policies
CREATE POLICY "Users can manage own leave requests" ON leave_requests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Managers can view and approve leave requests" ON leave_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'dept_admin', 'team_lead')
    )
  );

-- Expenses policies
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Managers can view and approve expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin', 'dept_admin', 'team_lead')
    )
  );

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();