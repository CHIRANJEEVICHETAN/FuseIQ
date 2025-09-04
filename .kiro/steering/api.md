# EvolveSync - API Documentation

## 🌐 **API Overview**

EvolveSync provides a comprehensive RESTful API built with Express.js and TypeScript. The API follows REST conventions and provides type-safe endpoints for all application features.

### **Base URL**
- **Development**: `http://localhost:3001/api`
- **Production**: `https://fuseiq.onrender.com/api`

### **Authentication**
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🔐 **Authentication Endpoints**

### **POST /auth/login**
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "EMPLOYEE",
      "departmentId": "uuid"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **POST /auth/logout**
Logout user and invalidate tokens.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### **POST /auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### **GET /auth/me**
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "EMPLOYEE",
    "departmentId": "uuid",
    "phone": "+1234567890",
    "position": "Software Developer",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

## 👥 **User Management Endpoints**

### **GET /users**
Get paginated list of users with filtering options.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role
- `departmentId` (string): Filter by department
- `isActive` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "EMPLOYEE",
        "departmentId": "uuid",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### **GET /users/:id**
Get specific user by ID.

### **PUT /users/:id**
Update user information.

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "position": "Senior Developer",
  "role": "TEAM_LEAD"
}
```

### **DELETE /users/:id**
Deactivate user account.

## 📋 **Task Management Endpoints**

### **GET /tasks**
Get paginated list of tasks.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by task status (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `projectId`: Filter by project
- `assigneeId`: Filter by assignee
- `reporterId`: Filter by reporter

### **POST /tasks**
Create new task.

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Create login and registration system",
  "priority": "HIGH",
  "projectId": "uuid",
  "assigneeId": "uuid",
  "estimatedHours": 8,
  "dueDate": "2024-01-20T00:00:00Z"
}
```

### **PUT /tasks/:id**
Update task.

### **DELETE /tasks/:id**
Delete task.

## 🏢 **Project Management Endpoints**

### **GET /projects**
Get paginated list of projects.

### **POST /projects**
Create new project.

**Request Body:**
```json
{
  "name": "EvolveSync Mobile App",
  "description": "Mobile application for EvolveSync",
  "priority": "HIGH",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-06-01T00:00:00Z",
  "budget": 50000,
  "departmentId": "uuid",
  "managerId": "uuid"
}
```

### **GET /projects/:id**
Get specific project with tasks and team members.

### **PUT /projects/:id**
Update project.

### **DELETE /projects/:id**
Delete project.

## ⏰ **Time Tracking Endpoints**

### **GET /time-entries**
Get time entries for current user or filtered by parameters.

### **POST /time-entries**
Create new time entry.

**Request Body:**
```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "description": "Working on authentication module",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T17:00:00Z",
  "durationMinutes": 480,
  "isBillable": true
}
```

### **POST /time-entries/timer/start**
Start timer for task.

### **POST /time-entries/timer/stop**
Stop timer and create time entry.

## 📅 **Attendance Endpoints**

### **GET /attendance**
Get attendance records.

### **POST /attendance/clock-in**
Clock in for the day.

**Request Body:**
```json
{
  "location": "Office",
  "notes": "Starting work day"
}
```

### **POST /attendance/clock-out**
Clock out for the day.

**Request Body:**
```json
{
  "notes": "Ending work day"
}
```

### **GET /attendance/today**
Get today's attendance record.

### **GET /attendance/stats**
Get attendance statistics.

## 🏖️ **Leave Management Endpoints**

### **GET /leave-requests**
Get leave requests.

### **POST /leave-requests**
Create new leave request.

**Request Body:**
```json
{
  "leaveType": "ANNUAL",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Family vacation"
}
```

### **PUT /leave-requests/:id/approve**
Approve leave request (HR/Admin only).

### **PUT /leave-requests/:id/reject**
Reject leave request (HR/Admin only).

### **GET /leave-requests/balance**
Get leave balance for current user.

## 💰 **Expense Management Endpoints**

### **GET /expenses**
Get expense records.

### **POST /expenses**
Create new expense.

**Request Body:**
```json
{
  "category": "TRAVEL",
  "amount": 150.00,
  "currency": "USD",
  "description": "Client meeting travel",
  "expenseDate": "2024-01-15",
  "projectId": "uuid"
}
```

### **PUT /expenses/:id/approve**
Approve expense (Manager/Admin only).

### **PUT /expenses/:id/reject**
Reject expense (Manager/Admin only).

## 🏢 **Department Endpoints**

### **GET /departments**
Get all departments.

### **POST /departments**
Create new department (Admin only).

### **PUT /departments/:id**
Update department (Admin only).

### **DELETE /departments/:id**
Delete department (Admin only).

## 📊 **Analytics & Reports Endpoints**

### **GET /analytics/dashboard**
Get dashboard analytics data.

### **GET /analytics/projects/:id/stats**
Get project statistics.

### **GET /analytics/users/:id/stats**
Get user performance statistics.

### **GET /analytics/attendance/summary**
Get attendance summary (HR/Admin only).

## 🔧 **Health & System Endpoints**

### **GET /health**
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "redis": "connected"
    }
  }
}
```

## 📝 **Error Response Format**

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

## 🔒 **Rate Limiting**

API endpoints are protected by rate limiting:

- **Authentication endpoints**: 50 requests per 15 minutes (development), 5 requests per 15 minutes (production)
- **General endpoints**: 100 requests per 15 minutes
- **File upload endpoints**: 10 requests per 15 minutes
- **Role-based limits**: Different limits based on user role

## 📋 **Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔄 **Pagination**

All list endpoints support pagination:

- `page`: Page number (starts from 1)
- `limit`: Items per page (max 100)
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

## 🔍 **Search & Filtering**

Most endpoints support search and filtering:

- `search`: Text search across relevant fields
- `filter`: Field-specific filtering
- `dateRange`: Date range filtering where applicable

## 📱 **WebSocket Support**

Real-time updates are available via WebSocket connections:

- **Connection**: `ws://localhost:3001/ws`
- **Authentication**: Send JWT token in connection headers
- **Events**: Task updates, notifications, real-time collaboration
