# 🚀 EvolveSync - Project Management & Employee Tracking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A comprehensive full-stack project management and employee tracking application built with modern technologies.

## ✨ **Features**

### 🔐 **Authentication & Authorization**
- **JWT-based Authentication** with refresh tokens
- **10 Hierarchical Roles** (Super Admin → Trainee)
- **Role-Based Access Control** with granular permissions
- **Secure Session Management** with Redis
- **Password Security** with bcrypt hashing

### 📋 **Project & Task Management**
- **Kanban Board** with drag-and-drop functionality
- **Project Organization** by departments
- **Task Assignment** with priority levels and due dates
- **Time Estimation** and tracking per task
- **Progress Monitoring** with real-time updates

### ⏰ **Time & Attendance Management**
- **Time Tracking** with start/stop timer
- **Attendance System** with clock in/out
- **Break Management** and overtime calculation
- **Location Tracking** for remote work
- **Comprehensive Reports** and analytics

### 🏖️ **Leave Management**
- **Multiple Leave Types** (Annual, Sick, Maternity, etc.)
- **Approval Workflow** with role-based permissions
- **Leave Balance** calculation and tracking
- **Calendar Integration** with conflict detection
- **Department Analytics** and reporting

### 💰 **Expense Management**
- **Expense Submission** with receipt upload
- **Multi-level Approval** workflow
- **Budget Tracking** per project and department
- **Reimbursement Processing** automation
- **Comprehensive Analytics** and reporting

### 📊 **Dashboard & Analytics**
- **Executive Dashboard** with key metrics
- **Role-based Views** customized per user
- **Real-time Updates** with live synchronization
- **Performance Metrics** and productivity tracking
- **Advanced Reporting** across all modules

## 🏗️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** with custom design system
- **shadcn/ui** component library (50+ components)
- **TanStack Query** for server state management
- **Zustand** for client state management

### **Backend**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Zod** for validation

### **Development Tools**
- **Docker** for containerization
- **ESLint** for code quality
- **Prettier** for formatting
- **Nodemon** for development

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker and Docker Compose
- Git

### **1. Clone Repository**
```bash
git clone <repository-url>
cd FuseIQ
```

### **2. Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### **3. Start Development Environment**
```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
npm run dev:full
```

### **4. Access Application**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:8080 (admin@evolve-sync.com / admin123)
- **Redis Commander**: http://localhost:8081

### **5. Default Login Credentials**
- **Super Admin**: `admin@fuseiq.com` / `Admin123!`
- **HR Manager**: `hr@fuseiq.com` / `HR123!`
- **Project Manager**: `pm@fuseiq.com` / `PM123!`
- **Employee**: `employee@fuseiq.com` / `Employee123!`

## 📁 **Project Structure**

```
FuseIQ/
├── src/                          # Frontend React application
│   ├── components/               # React components by feature
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── tasks/               # Task management
│   │   ├── time/                # Time tracking
│   │   ├── attendance/          # Attendance tracking
│   │   ├── leave/               # Leave management
│   │   ├── expenses/            # Expense management
│   │   └── admin/               # Admin panel
│   ├── contexts/                # React context providers
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and configurations
│   ├── pages/                   # Top-level page components
│   └── types/                   # TypeScript definitions
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   ├── prisma/                  # Database schema and migrations
│   └── scripts/                 # Utility scripts
├── docs/                         # Project documentation
├── .kiro/                        # Kiro AI assistant configuration
└── prompt/                       # Project specifications
```

## 🎯 **User Roles & Permissions**

| Role | Level | Permissions |
|------|-------|-------------|
| **Super Admin** | 10 | Full system access, user management, system configuration |
| **Organization Admin** | 9 | Organization-wide management, department creation |
| **Department Admin** | 8 | Department-specific management, team oversight |
| **HR** | 7 | Human resources operations, employee records |
| **Project Manager** | 6 | Project planning, task assignment, team coordination |
| **Team Lead** | 5 | Team management, task oversight, reporting |
| **Employee** | 4 | Standard user access, task management |
| **Contractor** | 3 | Limited access for external workers |
| **Intern** | 2 | Restricted access for interns |
| **Trainee** | 1 | Basic access for new employees |

## 🔧 **Development Commands**

### **Frontend**
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Backend**
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run seed         # Seed database
```

### **Docker**
```bash
npm run docker:up    # Start all services
npm run docker:down  # Stop all services
npm run docker:logs  # View service logs
npm run docker:clean # Reset everything
```

## 📚 **Documentation**

- [Product Overview](.kiro/steering/product.md) - Comprehensive feature overview
- [Project Structure](.kiro/steering/structure.md) - Detailed project organization
- [Technology Stack](.kiro/steering/tech.md) - Complete tech stack details
- [API Documentation](.kiro/steering/api.md) - RESTful API reference
- [Deployment Guide](.kiro/steering/deployment.md) - Production deployment

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the EvolveSync Team**
