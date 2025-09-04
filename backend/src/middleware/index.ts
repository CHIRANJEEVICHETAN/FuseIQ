// Authentication middleware exports
export {
  authenticateToken,
  optionalAuth,
  requireAuth,
  requireActiveUser
} from './auth.middleware';

// RBAC middleware exports
export {
  requireRole,
  requireMinRole,
  requireAdmin,
  requireSuperAdmin,
  requireOrgAdmin,
  requireDeptAdmin,
  requireProjectManager,
  requireTeamLead,
  requireDepartmentAccess,
  requireUserAccess,
  requireUserManagement,
  checkPermission,
  getUserRoleLevel,
  isRoleHigher
} from './rbac.middleware';

// Rate limiting middleware exports
export {
  generalRateLimit,
  authRateLimit,
  passwordResetRateLimit,
  fileUploadRateLimit,
  creationRateLimit,
  strictRateLimit,
  createCustomRateLimit,
  roleBasedRateLimit,
  concurrentRequestLimit,
  cleanup as cleanupRateLimit
} from './rateLimit.middleware';

// Validation middleware exports
export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateFileUpload,
  handleValidationError,
  commonSchemas,
  authSchemas,
  userSchemas,
  departmentSchemas,
  projectSchemas,
  taskSchemas,
  timeEntrySchemas
} from './validation.middleware';