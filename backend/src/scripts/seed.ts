import { PrismaClient, UserRole, ProjectStatus, PriorityLevel, TaskStatus, AttendanceStatus, LeaveType, ApprovalStatus, ExpenseCategory, ExpenseStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Demo data
const demoUsers = [
  {
    email: 'superadmin@fuseiq.com',
    password: 'SuperAdmin123!',
    fullName: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    phone: '+1-555-0001',
    position: 'System Administrator',
    employeeId: 'EMP001',
    isActive: true,
  },
  {
    email: 'orgadmin@fuseiq.com',
    password: 'OrgAdmin123!',
    fullName: 'Organization Admin',
    role: UserRole.ORG_ADMIN,
    phone: '+1-555-0002',
    position: 'Organization Administrator',
    employeeId: 'EMP002',
    isActive: true,
  },
  {
    email: 'deptadmin@fuseiq.com',
    password: 'DeptAdmin123!',
    fullName: 'Department Admin',
    role: UserRole.DEPT_ADMIN,
    phone: '+1-555-0003',
    position: 'Department Administrator',
    employeeId: 'EMP003',
    isActive: true,
  },
  {
    email: 'projectmanager@fuseiq.com',
    password: 'ProjectManager123!',
    fullName: 'Project Manager',
    role: UserRole.PROJECT_MANAGER,
    phone: '+1-555-0004',
    position: 'Senior Project Manager',
    employeeId: 'EMP004',
    isActive: true,
  },
  {
    email: 'teamlead@fuseiq.com',
    password: 'TeamLead123!',
    fullName: 'Team Lead',
    role: UserRole.TEAM_LEAD,
    phone: '+1-555-0005',
    position: 'Technical Team Lead',
    employeeId: 'EMP005',
    isActive: true,
  },
  {
    email: 'employee@fuseiq.com',
    password: 'Employee123!',
    fullName: 'Regular Employee',
    role: UserRole.EMPLOYEE,
    phone: '+1-555-0006',
    position: 'Software Developer',
    employeeId: 'EMP006',
    isActive: true,
  },
  {
    email: 'contractor@fuseiq.com',
    password: 'Contractor123!',
    fullName: 'Contractor',
    role: UserRole.CONTRACTOR,
    phone: '+1-555-0007',
    position: 'Freelance Developer',
    employeeId: 'EMP007',
    isActive: true,
  },
  {
    email: 'intern@fuseiq.com',
    password: 'Intern123!',
    fullName: 'Summer Intern',
    role: UserRole.INTERN,
    phone: '+1-555-0008',
    position: 'Software Development Intern',
    employeeId: 'INT001',
    isActive: true,
  },
  {
    email: 'trainee@fuseiq.com',
    password: 'Trainee123!',
    fullName: 'New Trainee',
    role: UserRole.TRAINEE,
    phone: '+1-555-0009',
    position: 'Junior Developer Trainee',
    employeeId: 'TRN001',
    isActive: true,
  },
  {
    email: 'hr@fuseiq.com',
    password: 'HR123!',
    fullName: 'HR Manager',
    role: UserRole.HR,
    phone: '+1-555-0010',
    position: 'Human Resources Manager',
    employeeId: 'HR001',
    isActive: true,
  },
  // Additional demo users
  {
    email: 'john.doe@fuseiq.com',
    password: 'JohnDoe123!',
    fullName: 'John Doe',
    role: UserRole.EMPLOYEE,
    phone: '+1-555-0008',
    position: 'Frontend Developer',
    employeeId: 'EMP008',
    isActive: true,
  },
  {
    email: 'jane.smith@fuseiq.com',
    password: 'JaneSmith123!',
    fullName: 'Jane Smith',
    role: UserRole.EMPLOYEE,
    phone: '+1-555-0009',
    position: 'Backend Developer',
    employeeId: 'EMP009',
    isActive: true,
  },
  {
    email: 'mike.wilson@fuseiq.com',
    password: 'MikeWilson123!',
    fullName: 'Mike Wilson',
    role: UserRole.EMPLOYEE,
    phone: '+1-555-0010',
    position: 'UI/UX Designer',
    employeeId: 'EMP010',
    isActive: true,
  },
];

const demoDepartments = [
  {
    name: 'Engineering',
    description: 'Software development and technical operations',
    isActive: true,
  },
  {
    name: 'Product Management',
    description: 'Product strategy and roadmap planning',
    isActive: true,
  },
  {
    name: 'Design',
    description: 'User experience and visual design',
    isActive: true,
  },
  {
    name: 'Marketing',
    description: 'Brand management and customer acquisition',
    isActive: true,
  },
  {
    name: 'Sales',
    description: 'Customer acquisition and revenue generation',
    isActive: true,
  },
  {
    name: 'Human Resources',
    description: 'Talent acquisition and employee relations',
    isActive: true,
  },
  {
    name: 'Finance',
    description: 'Financial planning and accounting',
    isActive: true,
  },
];

const demoProjects = [
  {
    name: 'FuseIQ Platform Development',
    description: 'Main platform development and feature implementation',
    status: ProjectStatus.ACTIVE,
    priority: PriorityLevel.HIGH,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    budget: 500000.00,
    githubRepoUrl: 'https://github.com/fuseiq/platform',
  },
  {
    name: 'Mobile App Development',
    description: 'iOS and Android mobile application development',
    status: ProjectStatus.PLANNING,
    priority: PriorityLevel.MEDIUM,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-09-30'),
    budget: 250000.00,
    githubRepoUrl: 'https://github.com/fuseiq/mobile-app',
  },
  {
    name: 'API Integration',
    description: 'Third-party API integrations and microservices',
    status: ProjectStatus.ACTIVE,
    priority: PriorityLevel.HIGH,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    budget: 150000.00,
  },
  {
    name: 'UI/UX Redesign',
    description: 'Complete user interface and experience redesign',
    status: ProjectStatus.ON_HOLD,
    priority: PriorityLevel.MEDIUM,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-10-31'),
    budget: 100000.00,
  },
];

const demoTasks = [
  {
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication system with role-based access control',
    status: TaskStatus.DONE,
    priority: PriorityLevel.HIGH,
    estimatedHours: 40,
    actualHours: 45,
    dueDate: new Date('2024-02-15'),
  },
  {
    title: 'Design database schema',
    description: 'Create comprehensive database schema for all entities',
    status: TaskStatus.DONE,
    priority: PriorityLevel.HIGH,
    estimatedHours: 24,
    actualHours: 28,
    dueDate: new Date('2024-01-30'),
  },
  {
    title: 'Implement task management',
    description: 'Build task creation, assignment, and tracking functionality',
    status: TaskStatus.IN_PROGRESS,
    priority: PriorityLevel.MEDIUM,
    estimatedHours: 32,
    actualHours: 20,
    dueDate: new Date('2024-03-15'),
  },
  {
    title: 'Create project dashboard',
    description: 'Build project overview and analytics dashboard',
    status: TaskStatus.TODO,
    priority: PriorityLevel.MEDIUM,
    estimatedHours: 48,
    dueDate: new Date('2024-04-01'),
  },
  {
    title: 'Implement file upload',
    description: 'Add file upload functionality for documents and images',
    status: TaskStatus.TODO,
    priority: PriorityLevel.LOW,
    estimatedHours: 16,
    dueDate: new Date('2024-04-15'),
  },
];

const demoLeaveRequests = [
  {
    leaveType: LeaveType.ANNUAL,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-17'),
    days: 3,
    reason: 'Family vacation',
    status: ApprovalStatus.APPROVED,
  },
  {
    leaveType: LeaveType.SICK,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-20'),
    days: 1,
    reason: 'Doctor appointment',
    status: ApprovalStatus.APPROVED,
  },
  {
    leaveType: LeaveType.ANNUAL,
    startDate: new Date('2024-04-10'),
    endDate: new Date('2024-04-12'),
    days: 3,
    reason: 'Personal time off',
    status: ApprovalStatus.PENDING,
  },
];

const demoExpenses = [
  {
    category: ExpenseCategory.TRAVEL,
    amount: 250.00,
    currency: 'USD',
    description: 'Client meeting travel expenses',
    expenseDate: new Date('2024-02-15'),
    status: ExpenseStatus.APPROVED,
  },
  {
    category: ExpenseCategory.MEALS,
    amount: 45.50,
    currency: 'USD',
    description: 'Team lunch meeting',
    expenseDate: new Date('2024-02-20'),
    status: ExpenseStatus.SUBMITTED,
  },
  {
    category: ExpenseCategory.OFFICE_SUPPLIES,
    amount: 89.99,
    currency: 'USD',
    description: 'Office equipment purchase',
    expenseDate: new Date('2024-02-25'),
    status: ExpenseStatus.DRAFT,
  },
];

const demoAttendance = [
  {
    clockIn: new Date('2024-02-26T09:00:00Z'),
    clockOut: new Date('2024-02-26T17:30:00Z'),
    totalHours: 8.5,
    status: AttendanceStatus.PRESENT,
    location: 'Office',
    notes: 'Regular working day',
  },
  {
    clockIn: new Date('2024-02-27T09:15:00Z'),
    clockOut: new Date('2024-02-27T17:45:00Z'),
    totalHours: 8.5,
    status: AttendanceStatus.LATE,
    location: 'Office',
    notes: 'Traffic delay',
  },
  {
    clockIn: new Date('2024-02-28T08:45:00Z'),
    clockOut: new Date('2024-02-28T17:15:00Z'),
    totalHours: 8.5,
    status: AttendanceStatus.PRESENT,
    location: 'Office',
    notes: 'Early arrival',
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await prisma.expense.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.timeEntry.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    // Create departments
    console.log('🏢 Creating departments...');
    const departments = [];
    for (const deptData of demoDepartments) {
      const department = await prisma.department.create({
        data: deptData,
      });
      departments.push(department);
    }

    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const users = [];
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Assign department based on role
      let departmentId = null;
      if (userData.role === UserRole.EMPLOYEE || userData.role === UserRole.TEAM_LEAD) {
        departmentId = departments[0]?.id || null; // Engineering
      } else if (userData.role === UserRole.DEPT_ADMIN) {
        departmentId = departments[0]?.id || null; // Engineering
      } else if (userData.role === UserRole.PROJECT_MANAGER) {
        departmentId = departments[1]?.id || null; // Product Management
      }

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          departmentId,
          hireDate: new Date('2024-01-01'),
        },
      });
      users.push(user);
    }

    // Update department managers
    console.log('👨‍💼 Assigning department managers...');
    const deptAdmin = users.find(u => u.role === UserRole.DEPT_ADMIN);
    if (deptAdmin && departments[0]) {
      await prisma.department.update({
        where: { id: departments[0].id },
        data: { managerId: deptAdmin.id },
      });
    }

    // Create projects
    console.log('📋 Creating projects...');
    const projects = [];
    const projectManager = users.find(u => u.role === UserRole.PROJECT_MANAGER);
    for (const projectData of demoProjects) {
      const project = await prisma.project.create({
        data: {
          ...projectData,
          departmentId: departments[0]?.id || '', // Engineering
          managerId: projectManager?.id || users[0]?.id || '',
        },
      });
      projects.push(project);
    }

    // Create tasks
    console.log('✅ Creating tasks...');
    const teamLead = users.find(u => u.role === UserRole.TEAM_LEAD);
    const employee = users.find(u => u.role === UserRole.EMPLOYEE);
    
    for (const taskData of demoTasks) {
      await prisma.task.create({
        data: {
          ...taskData,
          projectId: projects[0]?.id || '',
          assigneeId: employee?.id || null,
          reporterId: teamLead?.id || users[0]?.id || '',
        },
      });
    }

    // Create leave requests
    console.log('🏖️ Creating leave requests...');
    for (const leaveData of demoLeaveRequests) {
      const { days, ...leaveDataWithoutDays } = leaveData;
      await prisma.leaveRequest.create({
        data: {
          ...leaveDataWithoutDays,
          daysRequested: days,
          userId: employee?.id || users[0]?.id || '',
          approvedBy: deptAdmin?.id || null,
        },
      });
    }

    // Create expenses
    console.log('💰 Creating expenses...');
    for (const expenseData of demoExpenses) {
      await prisma.expense.create({
        data: {
          ...expenseData,
          userId: employee?.id || users[0]?.id || '',
          approvedBy: deptAdmin?.id || null,
        },
      });
    }

    // Create attendance records
    console.log('⏰ Creating attendance records...');
    for (const attendanceData of demoAttendance) {
      await prisma.attendance.create({
        data: {
          ...attendanceData,
          date: attendanceData.clockIn,
          userId: employee?.id || users[0]?.id || '',
        },
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- ${departments.length} departments`);
    console.log(`- ${users.length} users`);
    console.log(`- ${projects.length} projects`);
    console.log(`- ${demoTasks.length} tasks`);
    console.log(`- ${demoLeaveRequests.length} leave requests`);
    console.log(`- ${demoExpenses.length} expenses`);
    console.log(`- ${demoAttendance.length} attendance records`);

    console.log('\n🔑 Demo account credentials:');
    console.log('Super Admin: superadmin@fuseiq.com / SuperAdmin123!');
    console.log('Org Admin: orgadmin@fuseiq.com / OrgAdmin123!');
    console.log('Dept Admin: deptadmin@fuseiq.com / DeptAdmin123!');
    console.log('Project Manager: projectmanager@fuseiq.com / ProjectManager123!');
    console.log('Team Lead: teamlead@fuseiq.com / TeamLead123!');
    console.log('Employee: employee@fuseiq.com / Employee123!');
    console.log('Contractor: contractor@fuseiq.com / Contractor123!');
          console.log('Intern: intern@fuseiq.com / Intern123!');
      console.log('Trainee: trainee@fuseiq.com / Trainee123!');
      console.log('HR: hr@fuseiq.com / HR123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seed;
