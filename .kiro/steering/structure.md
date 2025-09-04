# EvolveSync - Project Structure

## 📁 **Root Directory Structure**
```
FuseIQ/
├── src/                          # Frontend React application
├── backend/                      # Express.js API server
├── docs/                         # Project documentation
├── public/                       # Static assets and favicon
├── .kiro/                        # Kiro AI assistant configuration
├── .cursor/                      # Cursor IDE configuration
├── prompt/                       # Project specifications and prompts
├── components.json               # shadcn/ui component configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
└── README.md                     # Project overview
```

## 🎨 **Frontend Structure (`src/`)**
```
src/
├── components/                   # React components organized by feature
│   ├── ui/                      # shadcn/ui base components (50+ components)
│   │   ├── button.tsx           # Button component with variants
│   │   ├── card.tsx             # Card layout components
│   │   ├── dialog.tsx           # Modal dialog components
│   │   ├── form.tsx             # Form components with validation
│   │   ├── input.tsx            # Input field components
│   │   ├── select.tsx           # Select dropdown components
│   │   ├── table.tsx            # Data table components
│   │   ├── toast.tsx            # Toast notification system
│   │   └── ...                  # 40+ other UI components
│   ├── auth/                    # Authentication components
│   │   ├── AuthGuard.tsx        # Route protection component
│   │   ├── LoginForm.tsx        # Login form with animated background
│   │   └── types.ts             # Authentication type definitions
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── DashboardHeader.tsx  # Top navigation header
│   │   ├── DashboardHome.tsx    # Main dashboard overview
│   │   └── DashboardSidebar.tsx # Sidebar navigation
│   ├── admin/                   # Admin panel components
│   │   └── UserManagement.tsx   # User management interface
│   ├── attendance/              # Attendance tracking components
│   │   └── AttendanceTracker.tsx # Clock in/out interface
│   ├── expenses/                # Expense management components
│   │   └── ExpenseManagement.tsx # Expense submission and tracking
│   ├── leave/                   # Leave management components
│   │   └── LeaveManagement.tsx  # Leave request system
│   ├── tasks/                   # Task management components
│   │   └── TaskBoard.tsx        # Kanban board interface
│   └── time/                    # Time tracking components
│       └── TimeTracker.tsx      # Time tracking interface
├── contexts/                    # React context providers
│   ├── AuthContext.tsx          # Authentication state management
│   └── types.ts                 # Context type definitions
├── hooks/                       # Custom React hooks
│   ├── use-mobile.tsx           # Mobile device detection
│   └── use-toast.ts             # Toast notification hook
├── lib/                         # Utility functions and configurations
│   ├── api.ts                   # API client with JWT handling
│   ├── api-client.ts            # Axios-based HTTP client
│   ├── hooks/                   # TanStack Query hooks
│   │   └── use-api.ts           # API data fetching hooks
│   ├── providers/               # React providers
│   │   └── query-provider.tsx   # TanStack Query provider
│   ├── stores/                  # Zustand state stores
│   │   ├── auth-store.ts        # Authentication state
│   │   └── app-store.ts         # Application state
│   └── utils.ts                 # Utility functions
├── pages/                       # Top-level page components
│   ├── Index.tsx                # Main dashboard page
│   ├── LandingPage.tsx          # Marketing landing page
│   └── NotFound.tsx             # 404 error page
├── types/                       # TypeScript type definitions
│   └── database.ts              # Database schema types
├── App.tsx                      # Main application component
├── App.css                      # Global application styles
├── index.css                    # Tailwind CSS imports
└── main.tsx                     # Application entry point
```

## ⚙️ **Backend Structure (`backend/`)**
```
backend/
├── src/
│   ├── config/                  # Configuration files
│   │   ├── database.ts          # Prisma client configuration
│   │   ├── environment.ts       # Environment variables
│   │   ├── redis.ts             # Redis connection management
│   │   └── session.ts           # Session configuration
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── rbac.middleware.ts   # Role-based access control
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   ├── validation.middleware.ts # Request validation
│   │   └── index.ts             # Middleware exports
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.ts       # Authentication endpoints
│   │   ├── user.routes.ts       # User management endpoints
│   │   ├── project.routes.ts    # Project management endpoints
│   │   ├── task.routes.ts       # Task management endpoints
│   │   ├── attendance.routes.ts # Attendance endpoints
│   │   ├── leave.routes.ts      # Leave management endpoints
│   │   ├── expense.routes.ts    # Expense management endpoints
│   │   └── health.routes.ts     # Health check endpoints
│   ├── services/                # Business logic and data access
│   │   ├── auth.service.ts      # Authentication business logic
│   │   ├── user.service.ts      # User management logic
│   │   ├── project.service.ts   # Project management logic
│   │   ├── task.service.ts      # Task management logic
│   │   ├── attendance.service.ts # Attendance logic
│   │   ├── leave.service.ts     # Leave management logic
│   │   ├── expense.service.ts   # Expense management logic
│   │   ├── email.service.ts     # Email notification service
│   │   └── redis.service.ts     # Redis operations
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.types.ts         # API response types
│   │   ├── auth.types.ts        # Authentication types
│   │   └── session.types.ts     # Session types
│   ├── utils/                   # Utility functions
│   │   ├── jwt.util.ts          # JWT token utilities
│   │   ├── password.util.ts     # Password hashing utilities
│   │   ├── redis.util.ts        # Redis utility functions
│   │   └── response.util.ts     # API response utilities
│   └── server.ts                # Express server entry point
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma            # Prisma schema definition
│   ├── migrations/              # Database migration files
│   └── seed.ts                  # Database seeding script
├── scripts/                     # Utility scripts
│   └── seed.ts                  # Comprehensive seeding script
├── docker-compose.yml           # Docker services configuration
├── Dockerfile                   # Docker container configuration
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── package.json                 # Backend dependencies
├── tsconfig.json                # TypeScript configuration
├── nodemon.json                 # Development server configuration
└── README.md                    # Backend documentation
```

## 🔧 **Configuration Files**

### **Frontend Configuration**
- `components.json` - shadcn/ui component configuration
- `tailwind.config.ts` - Tailwind CSS with custom design system
- `vite.config.ts` - Vite build configuration with path aliases
- `tsconfig.json` - TypeScript configuration with strict mode
- `eslint.config.js` - ESLint rules and TypeScript support
- `postcss.config.js` - PostCSS configuration for Tailwind

### **Backend Configuration**
- `tsconfig.json` - TypeScript configuration for backend
- `nodemon.json` - Development server with hot reload
- `docker-compose.yml` - Multi-service Docker setup
- `.env.example` - Environment variables template

## 📋 **Key Conventions & Standards**

### **File Naming**
- **Components**: PascalCase (e.g., `UserManagement.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `apiClient.ts`)
- **Types**: camelCase with `.types.ts` suffix
- **Services**: camelCase with `.service.ts` suffix

### **Directory Organization**
- **Feature-based**: Components grouped by business domain
- **Separation of Concerns**: Clear separation between UI, logic, and data
- **Scalable Structure**: Easy to add new features and modules

### **Code Standards**
- **TypeScript**: Strict typing throughout the application
- **ESLint**: Consistent code formatting and quality
- **Prettier**: Automatic code formatting
- **Path Aliases**: Clean imports using `@/` prefix
- **Environment Variables**: Centralized configuration management

### **API Design**
- **RESTful**: Standard HTTP methods and status codes
- **Consistent Responses**: Standardized API response format
- **Error Handling**: Comprehensive error management
- **Validation**: Zod schema validation for all inputs
- **Documentation**: OpenAPI/Swagger documentation ready

### **Database Design**
- **Prisma ORM**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Seeding**: Comprehensive test data generation
- **Relationships**: Proper foreign key relationships
- **Indexing**: Performance-optimized database queries