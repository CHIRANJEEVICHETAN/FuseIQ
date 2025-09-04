import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as ProjectService from '../services/project.service';
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

// Apply general rate limiting to all project routes
router.use(generalRateLimit);

// Apply authentication to all project routes
router.use(authenticateToken);
router.use(requireActiveUser);

/**
 * GET /api/projects
 * Get projects
 */
router.get('/',
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    departmentId: z.string().uuid().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ProjectService.getProjects(req.query);
      
      res.json(createSuccessResponse(
        result,
        'Projects retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get projects error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECTS_FETCH_FAILED',
        'Failed to retrieve projects',
        req.path
      ));
    }
  }
);

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await ProjectService.getProjectById(req.params['id']!);
      
      if (!project) {
        res.status(404).json(createErrorResponse(
          'PROJECT_NOT_FOUND',
          'Project not found',
          req.path
        ));
        return;
      }
      
      res.json(createSuccessResponse(
        project,
        'Project retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get project error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECT_FETCH_FAILED',
        'Failed to retrieve project',
        req.path
      ));
    }
  }
);

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/',
  creationRateLimit,
  validateBody(z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    departmentId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
    priority: z.string(),
    budget: z.number().positive().optional(),
    status: z.string().default('PLANNING')
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await ProjectService.createProject(req.body);
      
      res.status(201).json(createSuccessResponse(
        project,
        'Project created successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Create project error:', error);
      
      const statusCode = 400;
      let errorCode = 'PROJECT_CREATION_FAILED';
      let message = 'Failed to create project';

      if (error instanceof Error && error.message === 'INVALID_DEPARTMENT') {
        errorCode = 'INVALID_DEPARTMENT';
        message = 'Invalid department specified';
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
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(1000).optional(),
    departmentId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    priority: z.string().optional(),
    budget: z.number().positive().optional(),
    status: z.string().optional()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await ProjectService.updateProject(req.params['id']!, req.body);
      
      res.json(createSuccessResponse(
        project,
        'Project updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update project error:', error);
      
      let statusCode = 400;
      let errorCode = 'PROJECT_UPDATE_FAILED';
      let message = 'Failed to update project';

      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        statusCode = 404;
        errorCode = 'PROJECT_NOT_FOUND';
        message = 'Project not found';
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
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await ProjectService.deleteProject(req.params['id']!);
      
      res.json(createSuccessResponse(
        null,
        'Project deleted successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Delete project error:', error);
      
      let statusCode = 400;
      let errorCode = 'PROJECT_DELETE_FAILED';
      let message = 'Failed to delete project';

      if (error instanceof Error) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'PROJECT_NOT_FOUND';
          message = 'Project not found';
        } else if (error.message === 'UNAUTHORIZED_TO_DELETE_PROJECT') {
          statusCode = 403;
          errorCode = 'UNAUTHORIZED_TO_DELETE_PROJECT';
          message = 'Unauthorized to delete this project';
        } else if (error.message === 'CANNOT_DELETE_ACTIVE_PROJECT') {
          errorCode = 'CANNOT_DELETE_ACTIVE_PROJECT';
          message = 'Cannot delete active project';
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
 * GET /api/projects/:id/tasks
 * Get tasks for a project
 */
router.get('/:id/tasks',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ProjectService.getProjectTasks(req.params['id']!, req.query);
      
      res.json(createSuccessResponse(
        result,
        'Project tasks retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get project tasks error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECT_TASKS_FETCH_FAILED',
        'Failed to retrieve project tasks',
        req.path
      ));
    }
  }
);

/**
 * GET /api/projects/:id/expenses
 * Get expenses for a project
 */
router.get('/:id/expenses',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateQuery(z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'expenseDate', 'amount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ProjectService.getProjectExpenses(req.params['id']!, req.query);
      
      res.json(createSuccessResponse(
        result,
        'Project expenses retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get project expenses error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECT_EXPENSES_FETCH_FAILED',
        'Failed to retrieve project expenses',
        req.path
      ));
    }
  }
);

/**
 * GET /api/projects/:id/team
 * Get team members for a project
 */
router.get('/:id/team',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await ProjectService.getProjectTeam(req.params['id']!);
      
      res.json(createSuccessResponse(
        team,
        'Project team retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get project team error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECT_TEAM_FETCH_FAILED',
        'Failed to retrieve project team',
        req.path
      ));
    }
  }
);

/**
 * POST /api/projects/:id/team
 * Add team member to project
 */
router.post('/:id/team',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(z.object({
    userId: z.string().uuid(),
    role: z.string()
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const teamMember = await ProjectService.addTeamMember(req.params['id']!, req.body.userId, req.body.role, req.user!.id);
      
      res.status(201).json(createSuccessResponse(
        teamMember,
        'Team member added successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Add team member error:', error);
      
      let statusCode = 400;
      let errorCode = 'TEAM_MEMBER_ADD_FAILED';
      let message = 'Failed to add team member';

      if (error instanceof Error) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'PROJECT_NOT_FOUND';
          message = 'Project not found';
        } else if (error.message === 'USER_NOT_FOUND') {
          errorCode = 'USER_NOT_FOUND';
          message = 'User not found';
        } else if (error.message === 'USER_ALREADY_IN_PROJECT') {
          errorCode = 'USER_ALREADY_IN_PROJECT';
          message = 'User is already a member of this project';
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
 * DELETE /api/projects/:id/team/:userId
 * Remove team member from project
 */
router.delete('/:id/team/:userId',
  validateParams(z.object({ 
    id: commonSchemas.uuid,
    userId: commonSchemas.uuid
  })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await ProjectService.removeTeamMember(req.params['id']!, req.params['userId']!, req.user!.id);
      
      res.json(createSuccessResponse(
        null,
        'Team member removed successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Remove team member error:', error);
      
      let statusCode = 400;
      let errorCode = 'TEAM_MEMBER_REMOVE_FAILED';
      let message = 'Failed to remove team member';

      if (error instanceof Error) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'PROJECT_NOT_FOUND';
          message = 'Project not found';
        } else if (error.message === 'USER_NOT_IN_PROJECT') {
          errorCode = 'USER_NOT_IN_PROJECT';
          message = 'User is not a member of this project';
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
 * GET /api/projects/stats
 * Get project statistics
 */
router.get('/stats',
  validateQuery(z.object({
    departmentId: z.string().uuid().optional(),
    year: z.string().regex(/^\d{4}$/).transform(Number).optional()
  }), true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.query['departmentId'] as string;
      
      const stats = await ProjectService.getProjectStats(departmentId);
      
      res.json(createSuccessResponse(
        stats,
        'Project statistics retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get project stats error:', error);
      
      res.status(500).json(createErrorResponse(
        'PROJECT_STATS_FETCH_FAILED',
        'Failed to retrieve project statistics',
        req.path
      ));
    }
  }
);

export default router;
