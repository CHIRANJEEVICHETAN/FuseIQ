import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as TaskService from '../services/task.service';
import {
  authenticateToken,
  requireActiveUser,
  generalRateLimit,
  creationRateLimit,
  validateBody,
  validateQuery,
  validateParams,
  taskSchemas,
  commonSchemas
} from '../middleware';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

const router = Router();

// Apply general rate limiting to all task routes
router.use(generalRateLimit);

// Apply authentication to all task routes
router.use(authenticateToken);
router.use(requireActiveUser);

/**
 * GET /api/tasks
 * Get list of tasks
 */
router.get('/',
  validateQuery(taskSchemas.query, true),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await TaskService.getTasks(req.query);
      
      res.json(createSuccessResponse(
        result,
        'Tasks retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get tasks error:', error);
      
      res.status(500).json(createErrorResponse(
        'TASKS_FETCH_FAILED',
        'Failed to retrieve tasks',
        req.path
      ));
    }
  }
);

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await TaskService.getTaskById(req.params['id']!);
      
      if (!task) {
        res.status(404).json(createErrorResponse(
          'TASK_NOT_FOUND',
          'Task not found',
          req.path
        ));
        return;
      }
      
      res.json(createSuccessResponse(
        task,
        'Task retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get task error:', error);
      
      res.status(500).json(createErrorResponse(
        'TASK_FETCH_FAILED',
        'Failed to retrieve task',
        req.path
      ));
    }
  }
);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/',
  creationRateLimit,
  validateBody(taskSchemas.create),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await TaskService.createTask(req.body, req.user!.id);
      
      res.status(201).json(createSuccessResponse(
        task,
        'Task created successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Create task error:', error);
      
      const statusCode = 400;
      let errorCode = 'TASK_CREATION_FAILED';
      let message = 'Failed to create task';

      if (error instanceof Error) {
        if (error.message === 'INVALID_PROJECT') {
          errorCode = 'INVALID_PROJECT';
          message = 'Invalid project specified';
        } else if (error.message === 'INVALID_ASSIGNEE') {
          errorCode = 'INVALID_ASSIGNEE';
          message = 'Invalid assignee specified';
        } else if (error.message === 'INVALID_PARENT_TASK') {
          errorCode = 'INVALID_PARENT_TASK';
          message = 'Invalid parent task specified';
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
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  validateBody(taskSchemas.update),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await TaskService.updateTask(req.params['id']!, req.body);
      
      res.json(createSuccessResponse(
        task,
        'Task updated successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Update task error:', error);
      
      let statusCode = 400;
      let errorCode = 'TASK_UPDATE_FAILED';
      let message = 'Failed to update task';

      if (error instanceof Error) {
        if (error.message === 'TASK_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'TASK_NOT_FOUND';
          message = 'Task not found';
        } else if (error.message === 'INVALID_ASSIGNEE') {
          errorCode = 'INVALID_ASSIGNEE';
          message = 'Invalid assignee specified';
        } else if (error.message === 'INVALID_PARENT_TASK') {
          errorCode = 'INVALID_PARENT_TASK';
          message = 'Invalid parent task specified';
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
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id',
  validateParams(z.object({ id: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await TaskService.deleteTask(req.params['id']!);
      
      res.json(createSuccessResponse(
        null,
        'Task deleted successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Delete task error:', error);
      
      let statusCode = 400;
      let errorCode = 'TASK_DELETE_FAILED';
      let message = 'Failed to delete task';

      if (error instanceof Error) {
        if (error.message === 'TASK_NOT_FOUND') {
          statusCode = 404;
          errorCode = 'TASK_NOT_FOUND';
          message = 'Task not found';
        } else if (error.message === 'TASK_HAS_SUBTASKS') {
          errorCode = 'TASK_HAS_SUBTASKS';
          message = 'Cannot delete task with subtasks';
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
 * GET /api/tasks/project/:projectId
 * Get tasks by project
 */
router.get('/project/:projectId',
  validateParams(z.object({ projectId: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await TaskService.getTasksByProject(req.params['projectId']!);
      
      res.json(createSuccessResponse(
        tasks,
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
 * GET /api/tasks/assignee/:assigneeId
 * Get tasks by assignee
 */
router.get('/assignee/:assigneeId',
  validateParams(z.object({ assigneeId: commonSchemas.uuid })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await TaskService.getTasksByAssignee(req.params['assigneeId']!);
      
      res.json(createSuccessResponse(
        tasks,
        'Assignee tasks retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get assignee tasks error:', error);
      
      res.status(500).json(createErrorResponse(
        'ASSIGNEE_TASKS_FETCH_FAILED',
        'Failed to retrieve assignee tasks',
        req.path
      ));
    }
  }
);

/**
 * GET /api/tasks/stats
 * Get task statistics
 */
router.get('/stats',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const projectId = req.query['projectId'] as string;
      const stats = await TaskService.getTaskStats(projectId);
      
      res.json(createSuccessResponse(
        stats,
        'Task statistics retrieved successfully',
        req.path
      ));
    } catch (error: unknown) {
      console.error('Get task stats error:', error);
      
      res.status(500).json(createErrorResponse(
        'TASK_STATS_FETCH_FAILED',
        'Failed to retrieve task statistics',
        req.path
      ));
    }
  }
);

export default router;
