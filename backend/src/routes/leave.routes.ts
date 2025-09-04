import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as LeaveService from '../services/leave.service';
import {
  authenticateToken,
  requireActiveUser,
  generalRateLimit,
  creationRateLimit,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas
} from '../middleware';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

const router = Router();

// Apply general rate limiting to all leave routes
router.use(generalRateLimit);

// Apply authentication to all leave routes
router.use(authenticateToken);
router.use(requireActiveUser);

/**
 * GET /api/leave
 * Get leave requests
 */
router.get('/',
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    userId: z.string().uuid().optional(),
    leaveType: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'startDate', 'endDate']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await LeaveService.getLeaveRequests(req.query);
      
      res.json(createSuccessResponse(
        result,
        'Leave requests retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get leave requests error:', error);
      
      res.status(500).json(createErrorResponse(
        'LEAVE_REQUESTS_FETCH_FAILED',
        'Failed to retrieve leave requests',
        req.path
      ));
    }
  }
);

/**
 * GET /api/leave/:id
 * Get leave request by ID
 */
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await LeaveService.getLeaveRequestById(req.params['id']!);
      
      if (!request) {
        res.status(404).json(createErrorResponse(
          'LEAVE_REQUEST_NOT_FOUND',
          'Leave request not found',
          req.path
        ));
        return;
      }
      
      res.json(createSuccessResponse(
        request,
        'Leave request retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get leave request error:', error);
      
      res.status(500).json(createErrorResponse(
        'LEAVE_REQUEST_FETCH_FAILED',
        'Failed to retrieve leave request',
        req.path
      ));
    }
  }
);

/**
 * POST /api/leave
 * Create a new leave request
 */
router.post('/',
  creationRateLimit,
  validateBody(z.object({
    leaveType: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().max(500).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await LeaveService.createLeaveRequest(req.body, req.user!.id);
      
      res.status(201).json(createSuccessResponse(
        request,
        'Leave request created successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Create leave request error:', error);
      
      const statusCode = 400;
      let errorCode = 'LEAVE_REQUEST_CREATION_FAILED';
      let message = 'Failed to create leave request';

      if (error instanceof Error) {
        if (error.message === 'INVALID_DATE_RANGE') {
          errorCode = 'INVALID_DATE_RANGE';
          message = 'End date must be after start date';
        } else if (error.message === 'OVERLAPPING_LEAVE_REQUEST') {
          errorCode = 'OVERLAPPING_LEAVE_REQUEST';
          message = 'Overlapping leave request exists';
        }
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * PUT /api/leave/:id
 * Update a leave request
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    leaveType: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reason: z.string().max(500).optional(),
    status: z.string().optional(),
    rejectionReason: z.string().max(500).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await LeaveService.updateLeaveRequest(req.params['id']!, req.body, req.user!.id);
      
      res.json(createSuccessResponse(
        request,
        'Leave request updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update leave request error:', error);
      
      let statusCode = 400;
      let errorCode = 'LEAVE_REQUEST_UPDATE_FAILED';
      let message = 'Failed to update leave request';

      if (error instanceof Error) {
        if (error.message === 'LEAVE_REQUEST_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'LEAVE_REQUEST_NOT_FOUND';
          message = 'Leave request not found';
        } else if (error.message === 'INVALID_DATE_RANGE') {
          errorCode = 'INVALID_DATE_RANGE';
          message = 'End date must be after start date';
        }
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

/**
 * DELETE /api/leave/:id
 * Cancel a leave request
 */
router.delete('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await LeaveService.cancelLeaveRequest(req.params['id']!, req.user!.id);
      
      res.json(createSuccessResponse(
        request,
        'Leave request cancelled successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Cancel leave request error:', error);
      
      res.status(500).json(createErrorResponse(
        'LEAVE_REQUEST_CANCEL_FAILED',
        'Failed to cancel leave request',
        req.path
      ));
    }
  }
);

/**
 * GET /api/leave/balance
 * Get leave balance for current user
 */
router.get('/balance',
  validateQuery(z.object({
    year: z.string().regex(/^\d{4}$/).transform(Number).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const year = (req.query['year'] as unknown as number) || new Date().getFullYear();
      const balance = await LeaveService.getLeaveBalance(req.user!.id, year);
      
      res.json(createSuccessResponse(
        balance,
        'Leave balance retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get leave balance error:', error);
      
      res.status(500).json(createErrorResponse(
        'LEAVE_BALANCE_FETCH_FAILED',
        'Failed to retrieve leave balance',
        req.path
      ));
    }
  }
);

/**
 * GET /api/leave/stats
 * Get leave statistics
 */
router.get('/stats',
  validateQuery(z.object({
    departmentId: z.string().uuid().optional(),
    year: z.string().regex(/^\d{4}$/).transform(Number).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.query['departmentId'] as string;
      const year = (req.query['year'] as unknown as number) || new Date().getFullYear();
      
      const stats = await LeaveService.getLeaveStats(departmentId, year);
      
      res.json(createSuccessResponse(
        stats,
        'Leave statistics retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get leave stats error:', error);
      
      res.status(500).json(createErrorResponse(
        'LEAVE_STATS_FETCH_FAILED',
        'Failed to retrieve leave statistics',
        req.path
      ));
    }
  }
);

/**
 * GET /api/leave/pending
 * Get pending leave requests for approval
 */
router.get('/pending',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await LeaveService.getPendingLeaveRequests(req.user!.id);
      
      res.json(createSuccessResponse(
        requests,
        'Pending leave requests retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get pending leave requests error:', error);
      
      let statusCode = 500;
      let errorCode = 'PENDING_LEAVE_REQUESTS_FETCH_FAILED';
      let message = 'Failed to retrieve pending leave requests';

      if (error instanceof Error && error.message === 'APPROVER_NOT_FOUND') {
        statusCode = 404;
        errorCode = 'APPROVER_NOT_FOUND';
        message = 'Approver not found';
      }

      res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        req.path
      ));
    }
  }
);

export default router;
