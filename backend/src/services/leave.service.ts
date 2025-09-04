import { PrismaClient, LeaveRequest, User, LeaveType, ApprovalStatus } from '@prisma/client';
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
 * Leave request query schema for filtering and pagination
 */
const leaveRequestQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    userId: z.string().uuid().optional(),
    leaveType: z.nativeEnum(LeaveType).optional(),
    status: z.nativeEnum(ApprovalStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'startDate', 'endDate']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type LeaveRequestQuery = z.infer<typeof leaveRequestQuerySchema>;

/**
 * Create leave request schema
 */
const createLeaveRequestSchema = z.object({
    leaveType: z.nativeEnum(LeaveType),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    reason: z.string().max(500).optional()
});

export type CreateLeaveRequestData = z.infer<typeof createLeaveRequestSchema>;

/**
 * Update leave request schema
 */
const updateLeaveRequestSchema = z.object({
    leaveType: z.nativeEnum(LeaveType).optional(),
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional(),
    reason: z.string().max(500).optional(),
    status: z.nativeEnum(ApprovalStatus).optional(),
    rejectionReason: z.string().max(500).optional()
});

export type UpdateLeaveRequestData = z.infer<typeof updateLeaveRequestSchema>;

/**
 * Get leave requests with filtering and pagination
 */
export async function getLeaveRequests(query: Partial<LeaveRequestQuery> = {}): Promise<{
    requests: (LeaveRequest & { user?: User; approver?: User | null })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = leaveRequestQuerySchema.parse(query);
        
        const { page, limit, userId, leaveType, status, startDate, endDate, sortBy, sortOrder } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (userId) {
            where['userId'] = userId;
        }
        
        if (leaveType) {
            where['leaveType'] = leaveType;
        }
        
        if (status) {
            where['status'] = status;
        }
        
        if (startDate || endDate) {
            const orConditions: unknown[] = [];
            if (startDate) {
                orConditions.push({ startDate: { gte: new Date(startDate as string) } });
            }
            if (endDate) {
                orConditions.push({ endDate: { lte: new Date(endDate as string) } });
            }
            where['OR'] = orConditions;
        }

        // Execute queries in parallel
        const [requests, total] = await Promise.all([
            prismaClient.leaveRequest.findMany({
                where,
                include: {
                    user: true,
                    approver: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.leaveRequest.count({ where })
        ]);

        return {
            requests,
            total,
            page: page as number,
            limit: limit as number,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get leave requests error:', error);
        throw new Error('FAILED_TO_FETCH_LEAVE_REQUESTS');
    }
}

/**
 * Get leave request by ID
 */
export async function getLeaveRequestById(requestId: string): Promise<(LeaveRequest & { 
    user?: User; 
    approver?: User | null 
}) | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const request = await prismaClient.leaveRequest.findUnique({
            where: { id: requestId },
            include: {
                user: true,
                approver: true
            }
        });

        return request;
    } catch (error) {
        console.error('Get leave request by ID error:', error);
        throw new Error('FAILED_TO_FETCH_LEAVE_REQUEST');
    }
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(requestData: CreateLeaveRequestData, userId: string): Promise<LeaveRequest> {
    try {
        const prismaClient = getPrismaClient();
        
        // Validate dates
        if (requestData.endDate < requestData.startDate) {
            throw new Error('INVALID_DATE_RANGE');
        }

        // Check for overlapping leave requests
        const overlappingRequest = await prismaClient.leaveRequest.findFirst({
            where: {
                userId,
                status: { in: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED] },
                OR: [
                    {
                        startDate: { lte: requestData.endDate },
                        endDate: { gte: requestData.startDate }
                    }
                ]
            }
        });

        if (overlappingRequest) {
            throw new Error('OVERLAPPING_LEAVE_REQUEST');
        }

        // Calculate days requested
        const daysRequested = Math.ceil((requestData.endDate.getTime() - requestData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const request = await prismaClient.leaveRequest.create({
            data: {
                ...requestData,
                userId,
                daysRequested,
                status: ApprovalStatus.PENDING,
                reason: requestData.reason || null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                user: true
            }
        });

        return request;
    } catch (error) {
        console.error('Create leave request error:', error);
        if (error instanceof Error && ['INVALID_DATE_RANGE', 'OVERLAPPING_LEAVE_REQUEST'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_CREATE_LEAVE_REQUEST');
    }
}

/**
 * Update a leave request
 */
export async function updateLeaveRequest(
    requestId: string, 
    updates: UpdateLeaveRequestData, 
    updatedBy: string
): Promise<LeaveRequest> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if request exists
        const existingRequest = await prismaClient.leaveRequest.findUnique({
            where: { id: requestId }
        });

        if (!existingRequest) {
            throw new Error('LEAVE_REQUEST_NOT_FOUND');
        }

        // If updating dates, recalculate days requested
        let daysRequested = existingRequest.daysRequested;
        if (updates.startDate || updates.endDate) {
            const startDate = (updates.startDate as Date) || existingRequest.startDate;
            const endDate = (updates.endDate as Date) || existingRequest.endDate;
            
            if (endDate < startDate) {
                throw new Error('INVALID_DATE_RANGE');
            }
            
            daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }

        // If approving, set approvedBy and approvedAt
        const updateData: Record<string, unknown> = {
            ...updates,
            daysRequested,
            updatedAt: new Date()
        };

        if (updates.status === ApprovalStatus.APPROVED) {
            updateData['approvedBy'] = updatedBy;
            updateData['approvedAt'] = new Date();
        }

        const request = await prismaClient.leaveRequest.update({
            where: { id: requestId },
            data: updateData,
            include: {
                user: true,
                approver: true
            }
        });

        return request;
    } catch (error) {
        console.error('Update leave request error:', error);
        if (error instanceof Error && ['LEAVE_REQUEST_NOT_FOUND', 'INVALID_DATE_RANGE'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_LEAVE_REQUEST');
    }
}

/**
 * Cancel a leave request
 */
export async function cancelLeaveRequest(requestId: string, userId: string): Promise<LeaveRequest> {
    try {
        const prismaClient = getPrismaClient();
        
        const request = await prismaClient.leaveRequest.update({
            where: { 
                id: requestId,
                userId // Ensure user can only cancel their own requests
            },
            data: {
                status: ApprovalStatus.CANCELLED,
                updatedAt: new Date()
            },
            include: {
                user: true
            }
        });

        return request;
    } catch (error) {
        console.error('Cancel leave request error:', error);
        throw new Error('FAILED_TO_CANCEL_LEAVE_REQUEST');
    }
}

/**
 * Get leave balance for a user
 */
export async function getLeaveBalance(userId: string, year: number = new Date().getFullYear()): Promise<{
    annualLeave: { total: number; used: number; remaining: number };
    sickLeave: { total: number; used: number; remaining: number };
    personalLeave: { total: number; used: number; remaining: number };
    studyLeave: { total: number; used: number; remaining: number };
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        // Get approved leave requests for the year
        const approvedRequests = await prismaClient.leaveRequest.findMany({
            where: {
                userId,
                status: ApprovalStatus.APPROVED,
                startDate: { gte: startOfYear },
                endDate: { lte: endOfYear }
            }
        });

        // Calculate used days by leave type
        const usedDays = {
            annual: 0,
            sick: 0,
            personal: 0,
            study: 0
        };

        approvedRequests.forEach(request => {
            switch (request.leaveType) {
                case LeaveType.ANNUAL:
                    usedDays.annual += request.daysRequested;
                    break;
                case LeaveType.SICK:
                    usedDays.sick += request.daysRequested;
                    break;
                case LeaveType.MATERNITY:
                case LeaveType.PATERNITY:
                case LeaveType.BEREAVEMENT:
                case LeaveType.UNPAID:
                    usedDays.personal += request.daysRequested;
                    break;
                case LeaveType.STUDY:
                    usedDays.study += request.daysRequested;
                    break;
            }
        });

        // Default leave allocations (these could be configurable per user/department)
        const totalDays = {
            annual: 20,
            sick: 10,
            personal: 5,
            study: 3
        };

        return {
            annualLeave: {
                total: totalDays.annual,
                used: usedDays.annual,
                remaining: totalDays.annual - usedDays.annual
            },
            sickLeave: {
                total: totalDays.sick,
                used: usedDays.sick,
                remaining: totalDays.sick - usedDays.sick
            },
            personalLeave: {
                total: totalDays.personal,
                used: usedDays.personal,
                remaining: totalDays.personal - usedDays.personal
            },
            studyLeave: {
                total: totalDays.study,
                used: usedDays.study,
                remaining: totalDays.study - usedDays.study
            }
        };
    } catch (error) {
        console.error('Get leave balance error:', error);
        throw new Error('FAILED_TO_FETCH_LEAVE_BALANCE');
    }
}

/**
 * Get leave statistics
 */
export async function getLeaveStats(departmentId?: string, year: number = new Date().getFullYear()): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    requestsByType: Record<LeaveType, number>;
    averageProcessingTime: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const where: Record<string, unknown> = {
            createdAt: { gte: startOfYear, lte: endOfYear }
        };

        if (departmentId) {
            where['user'] = { departmentId };
        }

        const [
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            requestsByType
        ] = await Promise.all([
            prismaClient.leaveRequest.count({ where }),
            prismaClient.leaveRequest.count({ where: { ...where, status: ApprovalStatus.PENDING } }),
            prismaClient.leaveRequest.count({ where: { ...where, status: ApprovalStatus.APPROVED } }),
            prismaClient.leaveRequest.count({ where: { ...where, status: ApprovalStatus.REJECTED } }),
            prismaClient.leaveRequest.groupBy({
                by: ['leaveType'],
                _count: { leaveType: true },
                where
            })
        ]);

        // Format requests by type
        const typeStats: Record<LeaveType, number> = {
            ANNUAL: 0,
            SICK: 0,
            MATERNITY: 0,
            PATERNITY: 0,
            BEREAVEMENT: 0,
            STUDY: 0,
            UNPAID: 0
        };

        requestsByType.forEach(stat => {
            typeStats[stat.leaveType] = stat._count.leaveType;
        });

        // Calculate average processing time (simplified)
        const averageProcessingTime = 0; // This would require more complex calculation

        return {
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            requestsByType: typeStats,
            averageProcessingTime
        };
    } catch (error) {
        console.error('Get leave stats error:', error);
        throw new Error('FAILED_TO_FETCH_LEAVE_STATS');
    }
}

/**
 * Get pending leave requests for approval
 */
export async function getPendingLeaveRequests(approverId: string): Promise<(LeaveRequest & { user?: User })[]> {
    try {
        const prismaClient = getPrismaClient();
        
        // Get approver's department
        const approver = await prismaClient.user.findUnique({
            where: { id: approverId },
            include: { department: true }
        });

        if (!approver) {
            throw new Error('APPROVER_NOT_FOUND');
        }

        // Get pending requests from users in the same department
        const requests = await prismaClient.leaveRequest.findMany({
            where: {
                status: ApprovalStatus.PENDING,
                user: {
                    departmentId: approver.departmentId
                }
            },
            include: {
                user: true
            },
            orderBy: { createdAt: 'asc' }
        });

        return requests;
    } catch (error) {
        console.error('Get pending leave requests error:', error);
        throw new Error('FAILED_TO_FETCH_PENDING_LEAVE_REQUESTS');
    }
}
