import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as ExpenseService from '../services/expense.service';
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

// Apply general rate limiting to all expense routes
router.use(generalRateLimit);

// Apply authentication to all expense routes
router.use(authenticateToken);
router.use(requireActiveUser);

/**
 * GET /api/expenses
 * Get expenses
 */
router.get('/',
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    userId: z.string().uuid().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    maxAmount: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    sortBy: z.enum(['createdAt', 'expenseDate', 'amount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ExpenseService.getExpenses(req.query);
      
      res.json(createSuccessResponse(
        result,
        'Expenses retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get expenses error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSES_FETCH_FAILED',
        'Failed to retrieve expenses',
        req.path
      ));
    }
  }
);

/**
 * GET /api/expenses/:id
 * Get expense by ID
 */
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.getExpenseById(req.params['id']!);
      
      if (!expense) {
        res.status(404).json(createErrorResponse(
          'EXPENSE_NOT_FOUND',
          'Expense not found',
          req.path
        ));
        return;
      }
      
      res.json(createSuccessResponse(
        expense,
        'Expense retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get expense error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSE_FETCH_FAILED',
        'Failed to retrieve expense',
        req.path
      ));
    }
  }
);

/**
 * POST /api/expenses
 * Create a new expense
 */
router.post('/',
  creationRateLimit,
  validateBody(z.object({
    category: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    description: z.string().min(1).max(500),
    expenseDate: z.string(),
    receiptUrl: z.string().url().optional(),
    projectId: z.string().uuid().optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.createExpense(req.body, req.user!.id);
      
      res.status(201).json(createSuccessResponse(
        expense,
        'Expense created successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Create expense error:', error);
      
      const statusCode = 400;
      let errorCode = 'EXPENSE_CREATION_FAILED';
      let message = 'Failed to create expense';

      if (error instanceof Error && error.message === 'INVALID_PROJECT') {
        errorCode = 'INVALID_PROJECT';
        message = 'Invalid project specified';
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
 * PUT /api/expenses/:id
 * Update an expense
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    category: z.string().optional(),
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    description: z.string().min(1).max(500).optional(),
    expenseDate: z.string().optional(),
    receiptUrl: z.string().url().optional(),
    projectId: z.string().uuid().optional(),
    status: z.string().optional(),
    rejectionReason: z.string().max(500).optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.updateExpense(req.params['id']!, req.body, req.user!.id);
      
      res.json(createSuccessResponse(
        expense,
        'Expense updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update expense error:', error);
      
      let statusCode = 400;
      let errorCode = 'EXPENSE_UPDATE_FAILED';
      let message = 'Failed to update expense';

      if (error instanceof Error && error.message === 'EXPENSE_NOT_FOUND') {
        statusCode = 404;
        errorCode = 'EXPENSE_NOT_FOUND';
        message = 'Expense not found';
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
 * DELETE /api/expenses/:id
 * Delete an expense
 */
router.delete('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await ExpenseService.deleteExpense(req.params['id']!, req.user!.id);
      
      res.json(createSuccessResponse(
        null,
        'Expense deleted successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Delete expense error:', error);
      
      let statusCode = 400;
      let errorCode = 'EXPENSE_DELETE_FAILED';
      let message = 'Failed to delete expense';

      if (error instanceof Error) {
        if (error.message === 'EXPENSE_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'EXPENSE_NOT_FOUND';
          message = 'Expense not found';
        } else if (error.message === 'UNAUTHORIZED_TO_DELETE_EXPENSE') {
          statusCode = 403;
          errorCode = 'UNAUTHORIZED_TO_DELETE_EXPENSE';
          message = 'Unauthorized to delete this expense';
        } else if (error.message === 'CANNOT_DELETE_APPROVED_EXPENSE') {
          errorCode = 'CANNOT_DELETE_APPROVED_EXPENSE';
          message = 'Cannot delete approved expense';
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
 * GET /api/expenses/stats
 * Get expense statistics
 */
router.get('/stats',
  validateQuery(z.object({
    userId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    year: z.string().regex(/^\d{4}$/).transform(Number).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query['userId'] as string;
      const departmentId = req.query['departmentId'] as string;
      const year = (req.query['year'] as unknown as number) || new Date().getFullYear();
      
      const stats = await ExpenseService.getExpenseStats(userId, departmentId, year);
      
      res.json(createSuccessResponse(
        stats,
        'Expense statistics retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get expense stats error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSE_STATS_FETCH_FAILED',
        'Failed to retrieve expense statistics',
        req.path
      ));
    }
  }
);

/**
 * GET /api/expenses/pending
 * Get pending expenses for approval
 */
router.get('/pending',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expenses = await ExpenseService.getPendingExpenses(req.user!.id);
      
      res.json(createSuccessResponse(
        expenses,
        'Pending expenses retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get pending expenses error:', error);
      
      let statusCode = 500;
      let errorCode = 'PENDING_EXPENSES_FETCH_FAILED';
      let message = 'Failed to retrieve pending expenses';

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

/**
 * POST /api/expenses/:id/approve
 * Approve an expense
 */
router.post('/:id/approve',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.approveExpense(req.params['id']!, req.user!.id);
      
      res.json(createSuccessResponse(
        expense,
        'Expense approved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Approve expense error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSE_APPROVAL_FAILED',
        'Failed to approve expense',
        req.path
      ));
    }
  }
);

/**
 * POST /api/expenses/:id/reject
 * Reject an expense
 */
router.post('/:id/reject',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    rejectionReason: z.string().min(1).max(500)
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.rejectExpense(req.params['id']!, req.user!.id, req.body.rejectionReason);
      
      res.json(createSuccessResponse(
        expense,
        'Expense rejected successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Reject expense error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSE_REJECTION_FAILED',
        'Failed to reject expense',
        req.path
      ));
    }
  }
);

/**
 * POST /api/expenses/:id/reimburse
 * Mark expense as reimbursed
 */
router.post('/:id/reimburse',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await ExpenseService.markExpenseAsReimbursed(req.params['id']!, req.user!.id);
      
      res.json(createSuccessResponse(
        expense,
        'Expense marked as reimbursed successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Mark expense as reimbursed error:', error);
      
      res.status(500).json(createErrorResponse(
        'EXPENSE_REIMBURSEMENT_FAILED',
        'Failed to mark expense as reimbursed',
        req.path
      ));
    }
  }
);

export default router;
