# Implementation Plan - Supabase to Custom Backend Migration

## Overview

This implementation plan converts the Supabase-based EvolveSync application to a custom Node.js/Express backend with PostgreSQL (Neon), Prisma ORM, and Redis caching. The plan follows a systematic approach to ensure zero downtime and data integrity during migration.

## Implementation Tasks

### Phase 1: Backend Infrastructure Setup

- [x] 1. Initialize Backend Project Structure





  - Dont write tests
  - Create backend directory with Node.js/Express TypeScript setup
  - Configure package.json with required dependencies (express, prisma, redis, bcrypt, jsonwebtoken, zod)
  - Set up TypeScript configuration with strict mode
  - Create folder structure (src/controllers, src/services, src/middleware, src/routes, src/utils, src/types)
  - _Requirements: 1.1, 1.4_

- [x] 2. Configure Development Environment





  - Dont write tests
  - Create Docker Compose file for PostgreSQL and Redis local development
  - Set up environment variables configuration with dotenv
  - Create .env.example file with all required environment variables
  - Configure nodemon for development hot reloading
  - _Requirements: 1.1, 9.1_

- [x] 3. Set up Database Connection with Prisma





  - Dont write tests
  - Initialize Prisma in the backend project
  - Configure Prisma to connect to Neon PostgreSQL database
  - Set up Prisma Client generation and database connection utilities
  - Create database connection health check endpoint
  - _Requirements: 1.2, 2.1_

- [x] 4. Configure Redis Connection





  - Dont write tests
  - Set up Redis client configuration with connection pooling
  - Create Redis connection utilities and health check
  - Implement Redis session store configuration
  - Add Redis error handling and reconnection logic
  - _Requirements: 1.3, 7.1_

### Phase 2: Database Schema Migration

- [x] 5. Convert Supabase Schema to Prisma Schema





  - Dont write tests
  - Analyze existing Supabase migrations (20250717160340_spring_poetry.sql, 20250717160423_winter_boat.sql, 20250717163017_amber_lake.sql)
  - Create comprehensive Prisma schema.prisma file with all models (User, Department, Project, Task, TimeEntry, Attendance, LeaveRequest, Expense)
  - Define all enums (UserRole, ProjectStatus, TaskStatus, PriorityLevel, AttendanceStatus, LeaveType, ApprovalStatus, ExpenseCategory, ExpenseStatus)
  - Set up proper relationships and constraints between models
  - _Requirements: 2.1, 2.2, 2.3_

- [X] 6. Create Database Migration Scripts
  - Dont write tests
  - Generate initial Prisma migration from schema
  - Create database seeding script with sample departments data
  - Implement data validation scripts to verify schema integrity
  - Test migration on local development database
  - _Requirements: 2.1, 6.4, 9.3_

- [X] 7. Implement Data Export from Supabase
  - Create scripts to export all existing data from Supabase tables
  - Export user profiles, departments, projects, tasks, time entries, attendance, leave requests, and expenses
  - Handle file exports from Supabase Storage (receipts, avatars)
  - Validate exported data completeness and integrity
  - _Requirements: 6.1, 6.5_

- [X] 8. Create Data Transformation and Import Scripts
  - Transform exported Supabase data to match new Prisma schema format
  - Handle UUID conversion and relationship mapping
  - Create import scripts for each table with proper foreign key handling
  - Implement data validation after import to ensure integrity
  - _Requirements: 6.2, 6.3, 6.6_

### Phase 3: Authentication System Implementation

- [x] 9. Implement Core Authentication Service






  - Dont write tests
  - Create AuthService class with register, login, logout, and token refresh methods
  - Implement bcrypt password hashing with proper salt rounds
  - Create JWT token generation and validation utilities
  - Implement secure password reset functionality with email tokens
  - _Requirements: 3.1, 3.2, 3.7, 8.1_

- [x] 10. Build Authentication Middleware





  - Dont write tests
  - Create JWT token verification middleware for protected routes
  - Implement role-based access control (RBAC) middleware
  - Create rate limiting middleware to prevent brute force attacks
  - Add request validation middleware using Zod schemas
  - _Requirements: 3.8, 4.7, 8.4_

- [ ] 11. Implement Session Management with Redis
  - Dont write tests
  - Create Redis-based session storage for user sessions
  - Implement session validation and automatic cleanup
  - Add concurrent session limits and session invalidation
  - Create session refresh mechanism with sliding expiration
  - _Requirements: 3.3, 3.6, 8.3_

- [ ] 12. Create Authentication API Endpoints
  - Dont write tests
  - Implement POST /api/auth/register endpoint with user creation
  - Create POST /api/auth/login endpoint with credential validation
  - Build POST /api/auth/logout endpoint with session cleanup
  - Implement POST /api/auth/refresh for token refresh
  - Add POST /api/auth/forgot-password and POST /api/auth/reset-password endpoints
  - _Requirements: 3.4, 3.5, 4.1_

### Phase 4: Core API Development

- [ ] 13. Implement User Management APIs
  - Dont write tests
  - Create UserController with CRUD operations for user profiles
  - Implement GET /api/users with pagination and filtering
  - Build PUT /api/users/:id for profile updates with validation
  - Create POST /api/users/:id/promote-super-admin endpoint
  - Add proper authorization checks for admin-only operations
  - _Requirements: 4.1, 2.3_

- [ ] 14. Build Department Management APIs
  - Dont write tests
  - Create DepartmentController with full CRUD operations
  - Implement GET /api/departments with hierarchical data
  - Build POST /api/departments with manager assignment
  - Create PUT /api/departments/:id and DELETE /api/departments/:id endpoints
  - Add department-based access control validation
  - _Requirements: 4.2, 2.4_

- [ ] 15. Develop Project Management APIs
  - Dont write tests
  - Create ProjectController with comprehensive project operations
  - Implement GET /api/projects with filtering by department and status
  - Build POST /api/projects with proper validation and authorization
  - Create PUT /api/projects/:id and DELETE /api/projects/:id endpoints
  - Add project manager assignment and permission validation
  - _Requirements: 4.3, 2.5_

- [ ] 16. Implement Task Management APIs
  - Dont write tests
  - Create TaskController with full task lifecycle management
  - Build GET /api/tasks with advanced filtering and sorting
  - Implement POST /api/tasks with hierarchy support (parent-child relationships)
  - Create PUT /api/tasks/:id with status transitions and assignment changes
  - Add task dependency validation and GitHub integration placeholders
  - _Requirements: 4.3, 2.5_

### Phase 5: Time Tracking and Attendance APIs

- [ ] 17. Build Time Entry Management APIs
  - Dont write tests
  - Create TimeEntryController with timer functionality
  - Implement GET /api/time-entries with user and project filtering
  - Build POST /api/time-entries/start-timer and POST /api/time-entries/stop-timer
  - Create manual time entry endpoints with validation
  - Add time calculation utilities and billable hours tracking
  - _Requirements: 4.4, 2.6_

- [ ] 18. Implement Attendance Management APIs
  - Dont write tests
  - Create AttendanceController with clock-in/out functionality
  - Build POST /api/attendance/clock-in and POST /api/attendance/clock-out endpoints
  - Implement GET /api/attendance with date range filtering
  - Create attendance status management and location tracking
  - Add attendance analytics and reporting endpoints
  - _Requirements: 4.4, 2.6_

### Phase 6: Leave and Expense Management APIs

- [ ] 19. Develop Leave Management APIs
  - Dont write tests
  - Create LeaveController with full leave request lifecycle
  - Implement GET /api/leave-requests with status and user filtering
  - Build POST /api/leave-requests with leave balance validation
  - Create approval endpoints: POST /api/leave-requests/:id/approve and POST /api/leave-requests/:id/reject
  - Add leave balance calculation and accrual logic
  - _Requirements: 4.5, 2.7_

- [ ] 20. Build Expense Management APIs
  - Dont write tests
  - Create ExpenseController with expense submission and approval
  - Implement GET /api/expenses with category and status filtering
  - Build POST /api/expenses with receipt upload functionality
  - Create approval endpoints: POST /api/expenses/:id/approve and POST /api/expenses/:id/reject
  - Add expense policy validation and multi-currency support
  - _Requirements: 4.6, 2.8_

### Phase 7: Frontend Integration

- [ ] 21. Create Custom API Client
  - Dont write tests
  - Build ApiClient class with axios for HTTP requests
  - Implement request/response interceptors for token management
  - Add automatic token refresh logic with retry mechanism
  - Create error handling for authentication and network errors
  - Add request/response logging for development
  - _Requirements: 5.7, 5.8_

- [ ] 22. Update AuthContext for Custom Backend
  - Dont write tests
  - Replace Supabase client calls with custom API calls in AuthContext
  - Implement login, register, logout functions using new API endpoints
  - Add token storage in httpOnly cookies or secure localStorage
  - Create automatic token refresh mechanism
  - Update user state management to work with new User model
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 23. Update AuthGuard Component
  - Dont write tests
  - Modify AuthGuard to work with new authentication system
  - Update role-based access control to use new UserRole enum
  - Implement proper loading states during authentication checks
  - Add error handling for authentication failures
  - Ensure backward compatibility with existing protected routes
  - _Requirements: 5.6, 5.8_

- [ ] 24. Update All Frontend Components
  - Dont write tests
  - Replace all Supabase client calls with new API client calls
  - Update data fetching in components to use new API endpoints
  - Modify form submissions to work with new API validation
  - Update error handling to work with new API error format
  - Test all existing functionality with new backend integration
  - _Requirements: 5.1, 5.8, 10.6_

### Phase 8: Security and Performance Implementation

- [X] 25. Implement Security Measures
  - Add comprehensive input validation using Zod schemas
  - Implement CORS configuration with proper origin restrictions
  - Add helmet middleware for security headers
  - Create audit logging for all user actions
  - Implement file upload security with type validation and virus scanning
  - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_

- [ ] 26. Optimize Performance with Caching
  - Implement Redis caching for frequently accessed data (user profiles, departments)
  - Add query optimization with Prisma includes and selects
  - Create database connection pooling configuration
  - Implement response compression and proper cache headers
  - Add performance monitoring and logging
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.7_

### Phase 9: Testing Implementation

- [X] 27. Create Backend Test Suite
  - Set up Jest testing framework with Supertest for API testing
  - Create unit tests for all services (AuthService, UserService, etc.)
  - Implement integration tests for all API endpoints
  - Add authentication and authorization tests
  - Create database test utilities with test database setup
  - _Requirements: 9.4_

- [X] 28. Update Frontend Tests
  - Update existing React component tests to work with new API client
  - Create tests for updated AuthContext functionality
  - Add integration tests for complete user authentication flows
  - Test API client error handling and retry mechanisms
  - Ensure all existing functionality tests pass with new backend
  - _Requirements: 10.6_

### Phase 10: Migration and Deployment

- [ ] 29. Create Migration Scripts and Documentation
  - Create comprehensive migration guide with step-by-step instructions
  - Build automated migration scripts for data transfer
  - Implement rollback procedures in case of migration issues
  - Create user notification system for migration process
  - Add troubleshooting guide for common migration problems
  - _Requirements: 6.7, 10.1, 10.4, 10.8_

- [ ] 30. Set up Production Deployment
  - Create Docker containers for backend services
  - Configure production environment variables and secrets
  - Set up Neon PostgreSQL database with proper connection pooling
  - Configure Redis Cloud or self-hosted Redis for production
  - Implement health checks and monitoring endpoints
  - _Requirements: 9.5, 9.6, 9.7_

- [X] 31. Execute Migration and Testing
  - Perform complete data migration from Supabase to new system
  - Validate all data integrity and relationships after migration
  - Test all application functionality with migrated data
  - Perform user acceptance testing with stakeholders
  - Monitor system performance and fix any issues
  - _Requirements: 6.4, 6.7, 10.2, 10.3_

- [ ] 32. Final Cleanup and Documentation
  - Remove all Supabase dependencies from frontend and backend
  - Update all documentation to reflect new architecture
  - Create API documentation for all endpoints
  - Update deployment guides and development setup instructions
  - Archive old Supabase configuration and migration artifacts
  - _Requirements: 9.8, 10.7_

## Migration Strategy Notes

### Data Migration Approach
1. **Parallel Development**: Build new backend while keeping Supabase running
2. **Gradual Migration**: Migrate data in phases to minimize downtime
3. **Validation**: Comprehensive data validation at each step
4. **Rollback Plan**: Ability to rollback to Supabase if issues arise

### Risk Mitigation
1. **Backup Strategy**: Full backup of Supabase data before migration
2. **Testing**: Comprehensive testing in staging environment
3. **Monitoring**: Real-time monitoring during migration
4. **Communication**: Clear communication with users about migration process

### Success Criteria
1. **Zero Data Loss**: All existing data successfully migrated
2. **Functionality Preservation**: All existing features work identically
3. **Performance Improvement**: Better response times and reliability
4. **Security Enhancement**: Improved security measures implemented
5. **User Experience**: Seamless transition for end users