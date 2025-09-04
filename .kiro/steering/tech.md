# EvolveSync - Technology Stack

## 🎨 **Frontend Technology Stack**

### **Core Framework**
- **React 18**: Latest React with concurrent features and Suspense
- **TypeScript**: Strict typing for better development experience
- **Vite**: Lightning-fast build tool with HMR (Hot Module Replacement)
- **React Router DOM**: Client-side routing with nested routes

### **UI & Styling**
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: High-quality, accessible component library (50+ components)
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Beautiful, customizable icons
- **CSS Variables**: Dynamic theming support
- **Glassmorphism Design**: Modern, elegant UI aesthetic

### **State Management**
- **TanStack Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight client state management
- **React Context**: Authentication and theme context providers
- **Local Storage**: Persistent state with automatic serialization

### **Form Handling & Validation**
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Controlled Components**: Full control over form state and validation

### **Development Tools**
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking
- **Vite Dev Server**: Fast development with HMR
- **Path Aliases**: Clean imports with `@/` prefix

## ⚙️ **Backend Technology Stack**

### **Core Runtime**
- **Node.js 18+**: JavaScript runtime with latest features
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Full-stack type safety
- **Nodemon**: Development server with auto-restart

### **Database & ORM**
- **PostgreSQL**: Robust, open-source relational database
- **Prisma ORM**: Type-safe database client with migrations
- **Database Migrations**: Version-controlled schema changes
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed queries for performance

### **Caching & Sessions**
- **Redis**: In-memory data store for caching and sessions
- **Redis Commander**: Web-based Redis management interface
- **Session Management**: Secure session storage with expiration
- **Token Storage**: JWT refresh token management

### **Authentication & Security**
- **JWT (JSON Web Tokens)**: Stateless authentication
- **bcrypt**: Password hashing with salt rounds
- **Rate Limiting**: API protection against abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: HTTP security headers
- **Input Validation**: Zod schema validation for all endpoints

### **Email & Notifications**
- **Nodemailer**: Email sending capabilities
- **SMTP Configuration**: Configurable email providers
- **Email Templates**: HTML email templates for notifications
- **Password Reset**: Secure password reset flow

## 🐳 **Development Environment**

### **Containerization**
- **Docker**: Containerized development environment
- **Docker Compose**: Multi-service orchestration
- **PostgreSQL Container**: Database service
- **Redis Container**: Caching service
- **pgAdmin**: Web-based PostgreSQL administration
- **Redis Commander**: Web-based Redis administration

### **Development Services**
- **Frontend**: `http://localhost:8080` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express server)
- **PostgreSQL**: `localhost:5432` (Database)
- **Redis**: `localhost:6379` (Cache)
- **pgAdmin**: `http://localhost:8080` (Database GUI)
- **Redis Commander**: `http://localhost:8081` (Redis GUI)

## 📦 **Package Management**

### **Frontend Dependencies**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.0",
  "typescript": "^5.2.0"
}
```

### **Backend Dependencies**
```json
{
  "express": "^4.18.0",
  "@prisma/client": "^5.22.0",
  "redis": "^4.7.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "zod": "^3.23.8",
  "nodemailer": "^6.9.8",
  "helmet": "^8.0.0",
  "cors": "^2.8.5"
}
```

## 🚀 **Development Commands**

### **Frontend Development**
```bash
# Development server
npm run dev                    # Start Vite dev server (port 8080)

# Building
npm run build                  # Production build
npm run build:dev              # Development build
npm run preview                # Preview production build

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint issues
npm run type-check             # TypeScript type checking
```

### **Backend Development**
```bash
# Development server
cd backend
npm run dev                    # Start with nodemon (auto-restart)
npm start                      # Start production server

# Database operations
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run database migrations
npm run prisma:studio          # Open Prisma Studio
npm run prisma:reset           # Reset database
npm run seed                   # Seed database with test data

# Docker operations
npm run docker:up              # Start all services
npm run docker:down            # Stop all services
npm run docker:logs            # View service logs
npm run docker:clean           # Reset everything
```

### **Full Stack Development**
```bash
# Start everything
npm run dev:full               # Start frontend + backend + services

# Database setup
npm run setup:db               # Setup database and seed data
npm run reset:db               # Reset and reseed database
```

## 🔧 **Configuration Files**

### **Frontend Configuration**
- `vite.config.ts` - Vite build configuration with path aliases
- `tailwind.config.ts` - Tailwind CSS with custom theme
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules and plugins
- `components.json` - shadcn/ui component configuration

### **Backend Configuration**
- `tsconfig.json` - TypeScript configuration for backend
- `nodemon.json` - Development server configuration
- `docker-compose.yml` - Multi-service Docker setup
- `.env.example` - Environment variables template

## 📁 **Path Aliases & Imports**

### **Frontend Path Aliases**
```typescript
// Clean imports using @/ prefix
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { User } from '@/types/database'
```

### **Backend Path Aliases**
```typescript
// Relative imports from src/
import { UserService } from '../services/user.service'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { UserRole } from '@prisma/client'
```

## 🎯 **Code Standards & Best Practices**

### **TypeScript Standards**
- **Strict Mode**: Enabled for better type safety
- **Interface Definitions**: Clear type definitions for all data structures
- **Generic Types**: Reusable type definitions
- **Type Guards**: Runtime type checking where needed

### **React Best Practices**
- **Functional Components**: Modern React with hooks
- **Custom Hooks**: Reusable logic extraction
- **Error Boundaries**: Graceful error handling
- **Memoization**: Performance optimization with React.memo and useMemo

### **API Design Standards**
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **Consistent Responses**: Standardized API response format
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation with Zod schemas
- **Documentation**: OpenAPI/Swagger ready

### **Database Best Practices**
- **Migrations**: Version-controlled schema changes
- **Indexing**: Performance-optimized queries
- **Relationships**: Proper foreign key constraints
- **Seeding**: Comprehensive test data generation
- **Backup**: Regular database backups

## 🔒 **Security Considerations**

### **Authentication Security**
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Redis-backed secure sessions
- **Rate Limiting**: API protection against abuse

### **Data Security**
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Secure configuration management

### **Infrastructure Security**
- **Docker Security**: Container security best practices
- **Network Security**: Isolated container networks
- **Secret Management**: Environment variable security
- **HTTPS Ready**: SSL/TLS configuration support