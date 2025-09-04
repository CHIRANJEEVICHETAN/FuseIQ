import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as AttendanceService from '../services/attendance.service';
import {
  authenticateToken,
  requireActiveUser,
  generalRateLimit,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas
} from '../middleware';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

const router = Router();

// Apply general rate limiting to all attendance routes
router.use(generalRateLimit);

// Apply authentication to all attendance routes
router.use(authenticateToken);
router.use(requireActiveUser);

/**
 * GET /api/attendance
 * Get attendance records
 */
router.get('/',
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    userId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    sortBy: z.enum(['date', 'clockIn', 'clockOut']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await AttendanceService.getAttendanceRecords(req.query);
      
      res.json(createSuccessResponse(
        result,
        'Attendance records retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get attendance records error:', error);
      
      res.status(500).json(createErrorResponse(
        'ATTENDANCE_FETCH_FAILED',
        'Failed to retrieve attendance records',
        req.path
      ));
    }
  }
);

/**
 * GET /api/attendance/today
 * Get today's attendance for current user
 */
router.get('/today',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const attendance = await AttendanceService.getTodayAttendance(req.user!.id);
      
      res.json(createSuccessResponse(
        attendance,
        'Today\'s attendance retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get today attendance error:', error);
      
      res.status(500).json(createErrorResponse(
        'TODAY_ATTENDANCE_FETCH_FAILED',
        'Failed to retrieve today\'s attendance',
        req.path
      ));
    }
  }
);

/**
 * POST /api/attendance/clock-in
 * Clock in for current user
 */
router.post('/clock-in',
  validateBody(z.object({
    location: z.string().max(200).optional(),
    notes: z.string().max(500).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const attendance = await AttendanceService.clockIn(req.user!.id, req.body);
      
      res.status(201).json(createSuccessResponse(
        attendance,
        'Clocked in successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Clock in error:', error);
      
      const statusCode = 400;
      let errorCode = 'CLOCK_IN_FAILED';
      let message = 'Failed to clock in';

      if (error instanceof Error && error.message === 'ALREADY_CLOCKED_IN') {
        errorCode = 'ALREADY_CLOCKED_IN';
        message = 'Already clocked in today';
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
 * POST /api/attendance/clock-out
 * Clock out for current user
 */
router.post('/clock-out',
  validateBody(z.object({
    notes: z.string().max(500).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const attendance = await AttendanceService.clockOut(req.user!.id, req.body);
      
      res.json(createSuccessResponse(
        attendance,
        'Clocked out successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Clock out error:', error);
      
      const statusCode = 400;
      let errorCode = 'CLOCK_OUT_FAILED';
      let message = 'Failed to clock out';

      if (error instanceof Error) {
        if (error.message === 'NO_CLOCK_IN_RECORD') {
          errorCode = 'NO_CLOCK_IN_RECORD';
          message = 'No clock in record found for today';
        } else if (error.message === 'NOT_CLOCKED_IN') {
          errorCode = 'NOT_CLOCKED_IN';
          message = 'Not clocked in today';
        } else if (error.message === 'ALREADY_CLOCKED_OUT') {
          errorCode = 'ALREADY_CLOCKED_OUT';
          message = 'Already clocked out today';
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
 * GET /api/attendance/history
 * Get attendance history for current user
 */
router.get('/history',
  validateQuery(z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = (req.query['limit'] as unknown as number) || 30;
      const history = await AttendanceService.getAttendanceHistory(req.user!.id, limit);
      
      res.json(createSuccessResponse(
        history,
        'Attendance history retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get attendance history error:', error);
      
      res.status(500).json(createErrorResponse(
        'ATTENDANCE_HISTORY_FETCH_FAILED',
        'Failed to retrieve attendance history',
        req.path
      ));
    }
  }
);

/**
 * GET /api/attendance/stats
 * Get attendance statistics for current user
 */
router.get('/stats',
  validateQuery(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const startDate = req.query['startDate'] ? new Date(req.query['startDate'] as string) : undefined;
      const endDate = req.query['endDate'] ? new Date(req.query['endDate'] as string) : undefined;
      
      const stats = await AttendanceService.getAttendanceStats(req.user!.id, startDate, endDate);
      
      res.json(createSuccessResponse(
        stats,
        'Attendance statistics retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get attendance stats error:', error);
      
      res.status(500).json(createErrorResponse(
        'ATTENDANCE_STATS_FETCH_FAILED',
        'Failed to retrieve attendance statistics',
        req.path
      ));
    }
  }
);

/**
 * PUT /api/attendance/:id
 * Update attendance record (admin only)
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    clockIn: z.string().datetime().optional(),
    clockOut: z.string().datetime().optional(),
    status: z.string().optional(),
    location: z.string().max(200).optional(),
    notes: z.string().max(500).optional(),
    breakDurationMinutes: z.number().int().min(0).optional(),
    totalHours: z.number().min(0).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updates = {
        ...req.body,
        clockIn: req.body.clockIn ? new Date(req.body.clockIn) : undefined,
        clockOut: req.body.clockOut ? new Date(req.body.clockOut) : undefined
      };
      
      const attendance = await AttendanceService.updateAttendanceRecord(req.params['id']!, updates, req.user!.id);
      
      res.json(createSuccessResponse(
        attendance,
        'Attendance record updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update attendance record error:', error);
      
      res.status(500).json(createErrorResponse(
        'ATTENDANCE_UPDATE_FAILED',
        'Failed to update attendance record',
        req.path
      ));
    }
  }
);

/**
 * GET /api/attendance/department/:departmentId/summary
 * Get department attendance summary (admin only)
 */
router.get('/department/:departmentId/summary',
  validateParams(z.object({ departmentId: commonSchemas.uuid })),
  validateQuery(z.object({
    date: z.string().optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const date = req.query['date'] ? new Date(req.query['date'] as string) : new Date();
      const summary = await AttendanceService.getDepartmentAttendanceSummary(req.params['departmentId']!, date);
      
      res.json(createSuccessResponse(
        summary,
        'Department attendance summary retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get department attendance summary error:', error);
      
      res.status(500).json(createErrorResponse(
        'DEPARTMENT_ATTENDANCE_SUMMARY_FETCH_FAILED',
        'Failed to retrieve department attendance summary',
        req.path
      ));
    }
  }
);

export default router;
