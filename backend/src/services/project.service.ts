import { PrismaClient, Project, User, ProjectStatus, PriorityLevel } from '@prisma/client';
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
 * Project query schema
 */
const projectQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    departmentId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'name', 'startDate', 'endDate', 'priority']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;

/**
 * Create project schema
 */
const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
    priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.number().positive().optional(),
    departmentId: z.string().uuid(),
    managerId: z.string().uuid(),
    githubRepoUrl: z.string().url().optional()
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

/**
 * Update project schema
 */
const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.number().positive().optional(),
    managerId: z.string().uuid().optional(),
    githubRepoUrl: z.string().url().optional()
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

/**
 * Get projects with filtering and pagination
 */
export async function getProjects(query: Partial<ProjectQuery> = {}): Promise<{
    projects: (Project & { 
        manager?: User; 
        department?: { id: string; name: string };
        _count?: { tasks: number };
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = projectQuerySchema.parse(query);
        
        const { page, limit, search, status, priority, departmentId, managerId, sortBy, sortOrder } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (search) {
            where['OR'] = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (status) {
            where['status'] = status;
        }
        
        if (priority) {
            where['priority'] = priority;
        }
        
        if (departmentId) {
            where['departmentId'] = departmentId;
        }
        
        if (managerId) {
            where['managerId'] = managerId;
        }

        // Execute queries in parallel
        const [projects, total] = await Promise.all([
            prismaClient.project.findMany({
                where,
                include: {
                    manager: true,
                    department: true,
                    _count: {
                        select: {
                            tasks: true
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.project.count({ where })
        ]);

        return {
            projects,
            total,
            page: page as number,
            limit: limit as number,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get projects error:', error);
        throw new Error('FAILED_TO_FETCH_PROJECTS');
    }
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<(Project & { 
    manager?: User; 
    department?: { id: string; name: string };
    tasks?: { id: string; title: string; status: string }[];
    _count?: { tasks: number };
}) | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const project = await prismaClient.project.findUnique({
            where: { id: projectId },
            include: {
                manager: true,
                department: true,
                tasks: {
                    include: {
                        assignee: true,
                        reporter: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        });

        return project;
    } catch (error) {
        console.error('Get project by ID error:', error);
        throw new Error('FAILED_TO_FETCH_PROJECT');
    }
}

/**
 * Create a new project
 */
export async function createProject(projectData: CreateProjectData): Promise<Project> {
    try {
        const prismaClient = getPrismaClient();
        
        // Parse and validate project data
        const validatedData = createProjectSchema.parse(projectData);
        
        // Validate department exists
        const department = await prismaClient.department.findUnique({
            where: { id: validatedData.departmentId }
        });
        if (!department) {
            throw new Error('INVALID_DEPARTMENT');
        }

        // Validate manager exists
        const manager = await prismaClient.user.findUnique({
            where: { id: validatedData.managerId }
        });
        if (!manager) {
            throw new Error('INVALID_MANAGER');
        }

        const project = await prismaClient.project.create({
            data: {
                ...validatedData,
                description: validatedData.description || null,
                startDate: validatedData.startDate || null,
                endDate: validatedData.endDate || null,
                budget: validatedData.budget || null,
                githubRepoUrl: validatedData.githubRepoUrl || null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                manager: true,
                department: true
            }
        });

        return project;
    } catch (error) {
        console.error('Create project error:', error);
        if (error instanceof Error && ['INVALID_DEPARTMENT', 'INVALID_MANAGER'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_CREATE_PROJECT');
    }
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: UpdateProjectData): Promise<Project> {
    try {
        const prismaClient = getPrismaClient();
        
        // Parse and validate update data
        const validatedUpdates = updateProjectSchema.parse(updates);
        
        // Check if project exists
        const existingProject = await prismaClient.project.findUnique({
            where: { id: projectId }
        });

        if (!existingProject) {
            throw new Error('PROJECT_NOT_FOUND');
        }

        // Validate manager if provided
        if (validatedUpdates.managerId) {
            const manager = await prismaClient.user.findUnique({
                where: { id: validatedUpdates.managerId }
            });
            if (!manager) {
                throw new Error('INVALID_MANAGER');
            }
        }

        // Filter out undefined values
        const updateData: Record<string, unknown> = {
            updatedAt: new Date()
        };
        
        if (validatedUpdates.name !== undefined) updateData['name'] = validatedUpdates.name;
        if (validatedUpdates.description !== undefined) updateData['description'] = validatedUpdates.description || null;
        if (validatedUpdates.status !== undefined) updateData['status'] = validatedUpdates.status;
        if (validatedUpdates.priority !== undefined) updateData['priority'] = validatedUpdates.priority;
        if (validatedUpdates.startDate !== undefined) updateData['startDate'] = validatedUpdates.startDate || null;
        if (validatedUpdates.endDate !== undefined) updateData['endDate'] = validatedUpdates.endDate || null;
        if (validatedUpdates.budget !== undefined) updateData['budget'] = validatedUpdates.budget || null;
        if (validatedUpdates.managerId !== undefined) updateData['managerId'] = validatedUpdates.managerId;
        if (validatedUpdates.githubRepoUrl !== undefined) updateData['githubRepoUrl'] = validatedUpdates.githubRepoUrl || null;

        const project = await prismaClient.project.update({
            where: { id: projectId },
            data: updateData,
            include: {
                manager: true,
                department: true
            }
        });

        return project;
    } catch (error) {
        console.error('Update project error:', error);
        if (error instanceof Error && ['PROJECT_NOT_FOUND', 'INVALID_MANAGER'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_PROJECT');
    }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if project exists
        const project = await prismaClient.project.findUnique({
            where: { id: projectId },
            include: {
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        });

        if (!project) {
            throw new Error('PROJECT_NOT_FOUND');
        }

        // Check if project has tasks
        if (project._count.tasks > 0) {
            throw new Error('PROJECT_HAS_TASKS');
        }

        await prismaClient.project.delete({
            where: { id: projectId }
        });
    } catch (error) {
        console.error('Delete project error:', error);
        if (error instanceof Error && ['PROJECT_NOT_FOUND', 'PROJECT_HAS_TASKS'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_DELETE_PROJECT');
    }
}

/**
 * Get projects by user (projects where user is manager)
 */
export async function getProjectsByUser(userId: string): Promise<Project[]> {
    try {
        const prismaClient = getPrismaClient();
        
        const projects = await prismaClient.project.findMany({
            where: {
                managerId: userId
            },
            include: {
                manager: true,
                department: true,
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return projects;
    } catch (error) {
        console.error('Get projects by user error:', error);
        throw new Error('FAILED_TO_FETCH_USER_PROJECTS');
    }
}

/**
 * Get project statistics
 */
export async function getProjectStats(departmentId?: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    projectsByStatus: Record<ProjectStatus, number>;
    projectsByPriority: Record<PriorityLevel, number>;
    averageProjectDuration: number;
    totalBudget: number;
    averageBudget: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const where = departmentId ? { departmentId } : {};

        const [
            totalProjects,
            activeProjects,
            completedProjects,
            projectsByStatus,
            projectsByPriority,
            projectsWithDuration,
            projectsWithBudget
        ] = await Promise.all([
            prismaClient.project.count({ where }),
            prismaClient.project.count({ where: { ...where, status: ProjectStatus.ACTIVE } }),
            prismaClient.project.count({ where: { ...where, status: ProjectStatus.COMPLETED } }),
            prismaClient.project.groupBy({
                by: ['status'],
                where,
                _count: { status: true }
            }),
            prismaClient.project.groupBy({
                by: ['priority'],
                where,
                _count: { priority: true }
            }),
            prismaClient.project.findMany({
                where: {
                    ...where,
                    startDate: { not: null },
                    endDate: { not: null }
                },
                select: {
                    startDate: true,
                    endDate: true
                }
            }),
            prismaClient.project.findMany({
                where: {
                    ...where,
                    budget: { not: null }
                },
                select: {
                    budget: true
                }
            })
        ]);

        // Calculate average duration
        const totalDuration = projectsWithDuration.reduce((sum, project) => {
            if (project.startDate && project.endDate) {
                return sum + (project.endDate.getTime() - project.startDate.getTime());
            }
            return sum;
        }, 0);
        const averageProjectDuration = projectsWithDuration.length > 0 
            ? totalDuration / projectsWithDuration.length / (1000 * 60 * 60 * 24) // Convert to days
            : 0;

        // Calculate budget statistics
        const totalBudget = projectsWithBudget.reduce((sum, project) => {
            return sum + Number(project.budget || 0);
        }, 0);
        const averageBudget = projectsWithBudget.length > 0 
            ? totalBudget / projectsWithBudget.length 
            : 0;

        // Format status and priority data
        const statusCounts: Record<ProjectStatus, number> = {
            [ProjectStatus.PLANNING]: 0,
            [ProjectStatus.ACTIVE]: 0,
            [ProjectStatus.ON_HOLD]: 0,
            [ProjectStatus.COMPLETED]: 0,
            [ProjectStatus.CANCELLED]: 0
        };

        const priorityCounts: Record<PriorityLevel, number> = {
            [PriorityLevel.LOW]: 0,
            [PriorityLevel.MEDIUM]: 0,
            [PriorityLevel.HIGH]: 0,
            [PriorityLevel.URGENT]: 0
        };

        projectsByStatus.forEach(item => {
            statusCounts[item.status] = item._count.status;
        });

        projectsByPriority.forEach(item => {
            priorityCounts[item.priority] = item._count.priority;
        });

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            projectsByStatus: statusCounts,
            projectsByPriority: priorityCounts,
            averageProjectDuration,
            totalBudget,
            averageBudget
        };
    } catch (error) {
        console.error('Get project stats error:', error);
        throw new Error('FAILED_TO_FETCH_PROJECT_STATS');
    }
}

/**
 * Get project tasks
 */
export async function getProjectTasks(projectId: string, _query: any = {}): Promise<any> {
    try {
        const prismaClient = getPrismaClient();
        
        const tasks = await prismaClient.task.findMany({
            where: { projectId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return {
            tasks,
            total: tasks.length
        };
    } catch (error) {
        console.error('Get project tasks error:', error);
        throw new Error('Failed to get project tasks');
    }
}

/**
 * Get project expenses
 */
export async function getProjectExpenses(projectId: string, _query: any = {}): Promise<any> {
    try {
        const prismaClient = getPrismaClient();
        
        const expenses = await prismaClient.expense.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return {
            expenses,
            total: expenses.length
        };
    } catch (error) {
        console.error('Get project expenses error:', error);
        throw new Error('Failed to get project expenses');
    }
}

/**
 * Get project team
 */
export async function getProjectTeam(_projectId: string): Promise<any> {
    try {
        // For now, return empty array as team management is not implemented
        return [];
    } catch (error) {
        console.error('Get project team error:', error);
        throw new Error('Failed to get project team');
    }
}

/**
 * Add team member
 */
export async function addTeamMember(_projectId: string, _userId: string, _role: string, _addedBy: string): Promise<any> {
    try {
        // For now, throw error as team management is not implemented
        throw new Error('Team management not implemented');
    } catch (error) {
        console.error('Add team member error:', error);
        throw new Error('Failed to add team member');
    }
}

/**
 * Remove team member
 */
export async function removeTeamMember(_projectId: string, _userId: string, _removedBy: string): Promise<void> {
    try {
        // For now, throw error as team management is not implemented
        throw new Error('Team management not implemented');
    } catch (error) {
        console.error('Remove team member error:', error);
        throw new Error('Failed to remove team member');
    }
}