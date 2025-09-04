import { PrismaClient, Task, TaskStatus, PriorityLevel, User, Project } from '@prisma/client';
import { z } from 'zod';

let prisma: PrismaClient | null = null;

/**
 * Get Prisma client instance
 */
function getPrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

/**
 * Task query schema for filtering and pagination
 */
const taskQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    projectId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    reporterId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'dueDate']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;

/**
 * Create task schema
 */
const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
    projectId: z.string().uuid(),
    assigneeId: z.string().uuid().optional(),
    parentTaskId: z.string().uuid().optional(),
    estimatedHours: z.number().positive().optional(),
    dueDate: z.date().optional(),
    githubIssueNumber: z.number().int().positive().optional(),
    githubPrNumber: z.number().int().positive().optional()
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;

/**
 * Update task schema
 */
const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    assigneeId: z.string().uuid().optional(),
    parentTaskId: z.string().uuid().optional(),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
    dueDate: z.date().optional(),
    githubIssueNumber: z.number().int().positive().optional(),
    githubPrNumber: z.number().int().positive().optional()
});

export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;

/**
 * Get list of tasks with filtering and pagination
 */
export async function getTasks(query: Partial<TaskQuery> = {}): Promise<{
    tasks: (Task & {
        assignee?: User | null;
        reporter?: User | null;
        project?: Project | null;
        parentTask?: Task | null;
        subTasks?: Task[];
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = taskQuerySchema.parse(query);
        
        const { page, limit, search, status, priority, projectId, assigneeId, reporterId, sortBy, sortOrder } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (search) {
            where['OR'] = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (status) {
            where['status'] = status;
        }
        
        if (priority) {
            where['priority'] = priority;
        }
        
        if (projectId) {
            where['projectId'] = projectId;
        }
        
        if (assigneeId) {
            where['assigneeId'] = assigneeId;
        }
        
        if (reporterId) {
            where['reporterId'] = reporterId;
        }

        // Execute queries in parallel
        const [tasks, total] = await Promise.all([
            prismaClient.task.findMany({
                where,
                include: {
                    assignee: true,
                    reporter: true,
                    project: true,
                    parentTask: true,
                    subTasks: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.task.count({ where })
        ]);

        return {
            tasks,
            total,
            page: page as number,
            limit: limit as number,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get tasks error:', error);
        throw new Error('FAILED_TO_FETCH_TASKS');
    }
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string): Promise<(Task & {
    assignee?: User | null;
    reporter?: User | null;
    project?: Project | null;
    parentTask?: Task | null;
    subTasks?: Task[];
}) | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const task = await prismaClient.task.findUnique({
            where: { id: taskId },
            include: {
                assignee: true,
                reporter: true,
                project: true,
                parentTask: true,
                subTasks: true
            }
        });

        return task;
    } catch (error) {
        console.error('Get task by ID error:', error);
        throw new Error('FAILED_TO_FETCH_TASK');
    }
}

/**
 * Create a new task
 */
export async function createTask(taskData: CreateTaskRequest, reporterId: string): Promise<Task> {
    try {
        const prismaClient = getPrismaClient();
        
        // Parse and validate task data
        const validatedData = createTaskSchema.parse(taskData);
        
        // Validate project exists
        const project = await prismaClient.project.findUnique({
            where: { id: validatedData.projectId }
        });
        if (!project) {
            throw new Error('INVALID_PROJECT');
        }

        // Validate assignee if provided
        if (validatedData.assigneeId) {
            const assignee = await prismaClient.user.findUnique({
                where: { id: validatedData.assigneeId }
            });
            if (!assignee) {
                throw new Error('INVALID_ASSIGNEE');
            }
        }

        // Validate parent task if provided
        if (validatedData.parentTaskId) {
            const parentTask = await prismaClient.task.findUnique({
                where: { id: validatedData.parentTaskId }
            });
            if (!parentTask) {
                throw new Error('INVALID_PARENT_TASK');
            }
        }

        const task = await prismaClient.task.create({
            data: {
                ...validatedData,
                description: validatedData.description || null,
                assigneeId: validatedData.assigneeId || null,
                parentTaskId: validatedData.parentTaskId || null,
                estimatedHours: validatedData.estimatedHours || null,
                dueDate: validatedData.dueDate || null,
                githubIssueNumber: validatedData.githubIssueNumber || null,
                githubPrNumber: validatedData.githubPrNumber || null,
                reporterId,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                assignee: true,
                reporter: true,
                project: true,
                parentTask: true
            }
        });

        return task;
    } catch (error) {
        console.error('Create task error:', error);
        if (error instanceof Error && ['INVALID_PROJECT', 'INVALID_ASSIGNEE', 'INVALID_PARENT_TASK'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_CREATE_TASK');
    }
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    try {
        const prismaClient = getPrismaClient();
        
        // Parse and validate update data
        const validatedUpdates = updateTaskSchema.parse(updates);
        
        // Check if task exists
        const existingTask = await prismaClient.task.findUnique({
            where: { id: taskId }
        });

        if (!existingTask) {
            throw new Error('TASK_NOT_FOUND');
        }

        // Validate assignee if provided
        if (validatedUpdates.assigneeId) {
            const assignee = await prismaClient.user.findUnique({
                where: { id: validatedUpdates.assigneeId }
            });
            if (!assignee) {
                throw new Error('INVALID_ASSIGNEE');
            }
        }

        // Validate parent task if provided
        if (validatedUpdates.parentTaskId) {
            const parentTask = await prismaClient.task.findUnique({
                where: { id: validatedUpdates.parentTaskId }
            });
            if (!parentTask) {
                throw new Error('INVALID_PARENT_TASK');
            }
        }

        // Filter out undefined values
        const updateData: Record<string, unknown> = {
            updatedAt: new Date()
        };
        
        if (validatedUpdates.title !== undefined) updateData['title'] = validatedUpdates.title;
        if (validatedUpdates.description !== undefined) updateData['description'] = validatedUpdates.description || null;
        if (validatedUpdates.status !== undefined) updateData['status'] = validatedUpdates.status;
        if (validatedUpdates.priority !== undefined) updateData['priority'] = validatedUpdates.priority;
        if (validatedUpdates.assigneeId !== undefined) updateData['assigneeId'] = validatedUpdates.assigneeId || null;
        if (validatedUpdates.parentTaskId !== undefined) updateData['parentTaskId'] = validatedUpdates.parentTaskId || null;
        if (validatedUpdates.estimatedHours !== undefined) updateData['estimatedHours'] = validatedUpdates.estimatedHours || null;
        if (validatedUpdates.actualHours !== undefined) updateData['actualHours'] = validatedUpdates.actualHours || null;
        if (validatedUpdates.dueDate !== undefined) updateData['dueDate'] = validatedUpdates.dueDate || null;
        if (validatedUpdates.githubIssueNumber !== undefined) updateData['githubIssueNumber'] = validatedUpdates.githubIssueNumber || null;
        if (validatedUpdates.githubPrNumber !== undefined) updateData['githubPrNumber'] = validatedUpdates.githubPrNumber || null;

        const task = await prismaClient.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                assignee: true,
                reporter: true,
                project: true,
                parentTask: true
            }
        });

        return task;
    } catch (error) {
        console.error('Update task error:', error);
        if (error instanceof Error && ['TASK_NOT_FOUND', 'INVALID_ASSIGNEE', 'INVALID_PARENT_TASK'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_TASK');
    }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if task exists
        const existingTask = await prismaClient.task.findUnique({
            where: { id: taskId }
        });

        if (!existingTask) {
            throw new Error('TASK_NOT_FOUND');
        }

        // Check if task has subTasks
        const subTasks = await prismaClient.task.findMany({
            where: { parentTaskId: taskId }
        });

        if (subTasks.length > 0) {
            throw new Error('TASK_HAS_SUBTASKS');
        }

        await prismaClient.task.delete({
            where: { id: taskId }
        });
    } catch (error) {
        console.error('Delete task error:', error);
        if (error instanceof Error && ['TASK_NOT_FOUND', 'TASK_HAS_SUBTASKS'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_DELETE_TASK');
    }
}

/**
 * Get tasks by project
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
    try {
        const prismaClient = getPrismaClient();
        
        const tasks = await prismaClient.task.findMany({
            where: { projectId },
            include: {
                assignee: true,
                reporter: true,
                parentTask: true,
                subTasks: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return tasks;
    } catch (error) {
        console.error('Get tasks by project error:', error);
        throw new Error('FAILED_TO_FETCH_PROJECT_TASKS');
    }
}

/**
 * Get tasks by assignee
 */
export async function getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    try {
        const prismaClient = getPrismaClient();
        
        const tasks = await prismaClient.task.findMany({
            where: { assigneeId },
            include: {
                assignee: true,
                reporter: true,
                project: true,
                parentTask: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return tasks;
    } catch (error) {
        console.error('Get tasks by assignee error:', error);
        throw new Error('FAILED_TO_FETCH_ASSIGNEE_TASKS');
    }
}

/**
 * Get task statistics
 */
export async function getTaskStats(projectId?: string): Promise<{
    totalTasks: number;
    tasksByStatus: Record<TaskStatus, number>;
    tasksByPriority: Record<PriorityLevel, number>;
    overdueTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const where = projectId ? { projectId } : {};
        
        const [
            totalTasks,
            tasksByStatus,
            tasksByPriority,
            overdueTasks,
            completedTasks
        ] = await Promise.all([
            prismaClient.task.count({ where }),
            prismaClient.task.groupBy({
                by: ['status'],
                _count: { status: true },
                where
            }),
            prismaClient.task.groupBy({
                by: ['priority'],
                _count: { priority: true },
                where
            }),
            prismaClient.task.count({
                where: {
                    ...where,
                    dueDate: { lt: new Date() },
                    status: { not: TaskStatus.DONE }
                }
            }),
            prismaClient.task.count({
                where: {
                    ...where,
                    status: TaskStatus.DONE
                }
            })
        ]);

        // Format status stats
        const statusStats: Record<TaskStatus, number> = {
            TODO: 0,
            IN_PROGRESS: 0,
            REVIEW: 0,
            DONE: 0,
            BLOCKED: 0
        };

        tasksByStatus.forEach(stat => {
            statusStats[stat.status] = stat._count.status;
        });

        // Format priority stats
        const priorityStats: Record<PriorityLevel, number> = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0
        };

        tasksByPriority.forEach(stat => {
            priorityStats[stat.priority] = stat._count.priority;
        });

        // Calculate average completion time (simplified)
        const averageCompletionTime = 0; // This would require more complex calculation

        return {
            totalTasks,
            tasksByStatus: statusStats,
            tasksByPriority: priorityStats,
            overdueTasks,
            completedTasks,
            averageCompletionTime
        };
    } catch (error) {
        console.error('Get task stats error:', error);
        throw new Error('FAILED_TO_FETCH_TASK_STATS');
    }
}
