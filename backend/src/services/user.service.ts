import { PrismaClient, User, UserRole } from '@prisma/client';
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
 * User query schema for filtering and pagination
 */
const userQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    departmentId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type UserQuery = z.infer<typeof userQuerySchema>;

/**
 * Get list of users with filtering and pagination
 */
export async function getUsers(query: Partial<UserQuery> = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = userQuerySchema.parse(query);
        
        const { page, limit, search, role, departmentId, isActive, sortBy, sortOrder } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (search) {
            where['OR'] = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (role) {
            where['role'] = role;
        }
        
        if (departmentId) {
            where['departmentId'] = departmentId;
        }
        
        if (isActive !== undefined) {
            where['isActive'] = isActive;
        }

        // Execute queries in parallel
        const [users, total] = await Promise.all([
            prismaClient.user.findMany({
                where,
                include: {
                    department: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.user.count({ where })
        ]);

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get users error:', error);
        throw new Error('FAILED_TO_FETCH_USERS');
    }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                department: true
            }
        });

        return user;
    } catch (error) {
        console.error('Get user by ID error:', error);
        throw new Error('FAILED_TO_FETCH_USER');
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string, 
    updates: {
        fullName?: string;
        phone?: string;
        position?: string;
        avatarUrl?: string;
    }
): Promise<User> {
    try {
        const prismaClient = getPrismaClient();
        
        const user = await prismaClient.user.update({
            where: { id: userId },
            data: {
                ...updates,
                updatedAt: new Date()
            },
            include: {
                department: true
            }
        });

        return user;
    } catch (error) {
        console.error('Update user profile error:', error);
        throw new Error('FAILED_TO_UPDATE_USER');
    }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole, _updatedBy: string): Promise<User> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if user exists
        const existingUser = await prismaClient.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            throw new Error('USER_NOT_FOUND');
        }

        const user = await prismaClient.user.update({
            where: { id: userId },
            data: {
                role: newRole,
                updatedAt: new Date()
            },
            include: {
                department: true
            }
        });

        return user;
    } catch (error) {
        console.error('Update user role error:', error);
        if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_USER_ROLE');
    }
}

/**
 * Update user department
 */
export async function updateUserDepartment(userId: string, departmentId: string | null, _updatedBy: string): Promise<User> {
    try {
        const prismaClient = getPrismaClient();
        
        // Validate department if provided
        if (departmentId) {
            const department = await prismaClient.department.findUnique({
                where: { id: departmentId }
            });
            if (!department) {
                throw new Error('INVALID_DEPARTMENT');
            }
        }

        const user = await prismaClient.user.update({
            where: { id: userId },
            data: {
                departmentId,
                updatedAt: new Date()
            },
            include: {
                department: true
            }
        });

        return user;
    } catch (error) {
        console.error('Update user department error:', error);
        if (error instanceof Error && (error.message === 'INVALID_DEPARTMENT')) {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_USER_DEPARTMENT');
    }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string, isActive: boolean, _updatedBy: string): Promise<User> {
    try {
        const prismaClient = getPrismaClient();
        
        const user = await prismaClient.user.update({
            where: { id: userId },
            data: {
                isActive,
                updatedAt: new Date()
            },
            include: {
                department: true
            }
        });

        return user;
    } catch (error) {
        console.error('Toggle user status error:', error);
        throw new Error('FAILED_TO_UPDATE_USER_STATUS');
    }
}

/**
 * Delete user (soft delete by deactivating)
 */
export async function deleteUser(userId: string, _deletedBy: string): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Soft delete by deactivating the user
        await prismaClient.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        throw new Error('FAILED_TO_DELETE_USER');
    }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<UserRole, number>;
    usersByDepartment: Array<{ departmentName: string; count: number }>;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole,
            usersByDepartment
        ] = await Promise.all([
            prismaClient.user.count(),
            prismaClient.user.count({ where: { isActive: true } }),
            prismaClient.user.count({ where: { isActive: false } }),
            prismaClient.user.groupBy({
                by: ['role'],
                _count: { role: true }
            }),
            prismaClient.user.groupBy({
                by: ['departmentId'],
                _count: { departmentId: true },
                where: { departmentId: { not: null } }
            })
        ]);

        // Format users by role
        const roleStats: Record<UserRole, number> = {
            SUPER_ADMIN: 0,
            ORG_ADMIN: 0,
            DEPT_ADMIN: 0,
            PROJECT_MANAGER: 0,
            TEAM_LEAD: 0,
            EMPLOYEE: 0,
            CONTRACTOR: 0,
            INTERN: 0,
            TRAINEE: 0,
            HR: 0
        };

        usersByRole.forEach(stat => {
            roleStats[stat.role] = stat._count.role;
        });

        // Format users by department
        const departmentStats = await Promise.all(
            usersByDepartment.map(async (stat) => {
                const department = await prismaClient.department.findUnique({
                    where: { id: stat.departmentId! }
                });
                return {
                    departmentName: department?.name || 'Unknown',
                    count: stat._count.departmentId
                };
            })
        );

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole: roleStats,
            usersByDepartment: departmentStats
        };
    } catch (error) {
        console.error('Get user stats error:', error);
        throw new Error('FAILED_TO_FETCH_USER_STATS');
    }
}

/**
 * Check if user can manage another user based on RBAC rules
 */
export async function canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
    try {
        const prismaClient = getPrismaClient();
        
        const [manager, targetUser] = await Promise.all([
            prismaClient.user.findUnique({ where: { id: managerId } }),
            prismaClient.user.findUnique({ where: { id: targetUserId } })
        ]);

        if (!manager || !targetUser) {
            return false;
        }

        // Super admin can manage everyone
        if (manager.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        // Org admin can manage everyone except super admin
        if (manager.role === UserRole.ORG_ADMIN && targetUser.role !== UserRole.SUPER_ADMIN) {
            return true;
        }

        // Dept admin can manage users in their department (except admins)
        if (manager.role === UserRole.DEPT_ADMIN && 
            targetUser.departmentId === manager.departmentId &&
            !([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN] as UserRole[]).includes(targetUser.role)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Check user management permission error:', error);
        return false;
    }
}
