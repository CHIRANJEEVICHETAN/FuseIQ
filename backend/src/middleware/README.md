# Authentication Middleware Documentation

This directory contains comprehensive middleware components for authentication, authorization, rate limiting, and request validation.

## Components

### 1. Authentication Middleware (`auth.middleware.ts`)

Handles JWT token verification and user authentication.

#### Functions:
- `authenticateToken`: Verifies JWT token and attaches user to request
- `optionalAuth`: Optional authentication (doesn't fail if token is missing)
- `requireAuth`: Ensures user is authenticated
- `requireActiveUser`: Ensures user account is active

#### Usage:
```typescript
import { authenticateToken, requireAuth, requireActiveUser } from '../middleware';

// Protect a route with authentication
router.get('/protected', 
  authenticateToken,
  requireAuth,
  requireActiveUser,
  (req, res) => {
    // req.user is now available
    res.json({ user: req.user });
  }
);
```

### 2. Role-Based Access Control (`rbac.middleware.ts`)

Implements role-based access control with hierarchical permissions.

#### Functions:
- `requireRole(roles)`: Requires specific role(s)
- `requireMinRole(minRole)`: Requires minimum role level
- `requireAdmin`: Requires admin role or higher
- `requireSuperAdmin`: Requires super admin role
- `requireDepartmentAccess`: Checks department access
- `requireUserAccess`: Checks user data access
- `requireUserManagement`: Checks user management permissions

#### Usage:
```typescript
import { requireAdmin, requireRole, requireMinRole } from '../middleware';
import { UserRole } from '@prisma/client';

// Admin only route
router.get('/admin-only', requireAdmin, handler);

// Multiple roles allowed
router.get('/managers', requireRole([UserRole.PROJECT_MANAGER, UserRole.DEPT_ADMIN]), handler);

// Minimum role required
router.get('/team-leads', requireMinRole(UserRole.TEAM_LEAD), handler);
```

### 3. Rate Limiting (`rateLimit.middleware.ts`)

Provides various rate limiting strategies to prevent abuse.

#### Available Rate Limiters:
- `generalRateLimit`: 100 requests per 15 minutes
- `authRateLimit`: 5 auth attempts per 15 minutes
- `passwordResetRateLimit`: 3 password resets per hour
- `fileUploadRateLimit`: 20 file uploads per hour
- `creationRateLimit`: 30 creation requests per hour
- `strictRateLimit`: 10 requests per hour for sensitive operations
- `roleBasedRateLimit`: Dynamic limits based on user role
- `concurrentRequestLimit`: Limits concurrent requests per user

#### Usage:
```typescript
import { authRateLimit, generalRateLimit, strictRateLimit } from '../middleware';

// Apply auth rate limiting to login
router.post('/login', authRateLimit, loginHandler);

// Apply general rate limiting to API routes
router.use('/api', generalRateLimit);

// Apply strict rate limiting to sensitive operations
router.post('/promote-admin', strictRateLimit, promoteHandler);
```

### 4. Request Validation (`validation.middleware.ts`)

Validates request data using Zod schemas.

#### Functions:
- `validate(options)`: Generic validation middleware
- `validateBody(schema)`: Validates request body
- `validateQuery(schema)`: Validates query parameters
- `validateParams(schema)`: Validates route parameters
- `validateHeaders(schema)`: Validates headers
- `validateFileUpload(options)`: Validates file uploads

#### Pre-defined Schemas:
- `commonSchemas`: UUID, email, password, pagination, etc.
- `authSchemas`: Login, register, password reset, etc.
- `userSchemas`: User profile, promotion, queries, etc.
- `departmentSchemas`: Department CRUD operations
- `projectSchemas`: Project management
- `taskSchemas`: Task management
- `timeEntrySchemas`: Time tracking

#### Usage:
```typescript
import { validateBody, validateQuery, authSchemas, commonSchemas } from '../middleware';
import { z } from 'zod';

// Validate login request
router.post('/login', 
  validateBody(authSchemas.login),
  loginHandler
);

// Validate UUID parameter
router.get('/users/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  getUserHandler
);

// Validate query parameters
router.get('/users',
  validateQuery(userSchemas.userQuery, true), // true = optional
  getUsersHandler
);
```

## Complete Example

Here's a complete example showing how to use all middleware components together:

```typescript
import { Router } from 'express';
import {
  authenticateToken,
  requireAuth,
  requireActiveUser,
  requireAdmin,
  generalRateLimit,
  creationRateLimit,
  validateBody,
  validateParams,
  userSchemas,
  commonSchemas
} from '../middleware';

const router = Router();

// Apply rate limiting to all routes
router.use(generalRateLimit);

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAuth);
router.use(requireActiveUser);

// Create user (admin only, with validation and rate limiting)
router.post('/',
  requireAdmin,                              // Authorization
  creationRateLimit,                         // Rate limiting
  validateBody(userSchemas.create),          // Request validation
  createUserHandler
);

// Get user by ID (with parameter validation and access control)
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  requireUserAccess((req) => req.params['id']),
  getUserHandler
);

export default router;
```

## Error Handling

All middleware components use consistent error response format:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details?: any
  },
  timestamp: "2023-01-01T00:00:00.000Z",
  path: "/api/endpoint"
}
```

## Rate Limiting Details

### Redis Configuration
Rate limiting uses Redis for distributed rate limiting. Make sure Redis is configured properly in your environment.

### Rate Limit Headers
All rate limiters include standard headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

### Custom Rate Limits
You can create custom rate limits using `createCustomRateLimit`:

```typescript
const customLimit = createCustomRateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 10,                // 10 requests
  keyPrefix: 'custom'     // Redis key prefix
});

router.use('/special', customLimit);
```

## Security Considerations

1. **JWT Security**: Tokens are verified with proper issuer and audience
2. **Password Security**: Bcrypt with proper salt rounds
3. **Rate Limiting**: Multiple layers to prevent abuse
4. **Input Validation**: Comprehensive validation with Zod
5. **Role Hierarchy**: Proper role-based access control
6. **Session Management**: Redis-based session storage

## Performance Tips

1. Use `optionalAuth` for public endpoints that benefit from user context
2. Apply rate limiting at the router level for better performance
3. Use specific validation schemas to avoid over-validation
4. Consider caching user permissions for frequently accessed routes
5. Monitor Redis performance for rate limiting operations