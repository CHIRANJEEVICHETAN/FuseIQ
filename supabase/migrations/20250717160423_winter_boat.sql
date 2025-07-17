/*
  # Seed Data for Development

  1. Create sample departments
  2. Create admin user profile
  3. Create sample projects
  4. Create sample tasks
*/

-- Insert sample departments
INSERT INTO departments (id, name, description, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Engineering', 'Software development and technical operations', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Design', 'UI/UX design and creative services', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Marketing', 'Marketing and business development', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Human Resources', 'HR and people operations', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Finance', 'Financial operations and accounting', true);

-- Note: Admin user will be created when they first sign up
-- The trigger will automatically create a profile, then they can update their role to super_admin

-- Insert sample projects (these will be created after admin user exists)
-- We'll create these through the application interface