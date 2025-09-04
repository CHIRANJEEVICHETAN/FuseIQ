import { PrismaClient, Expense, User, ExpenseCategory, ExpenseStatus } from '@prisma/client';
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
 * Expense query schema for filtering and pagination
 */
const expenseQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    userId: z.string().uuid().optional(),
    category: z.nativeEnum(ExpenseCategory).optional(),
    status: z.nativeEnum(ExpenseStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    sortBy: z.enum(['createdAt', 'expenseDate', 'amount']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;

/**
 * Create expense schema
 */
const createExpenseSchema = z.object({
    category: z.nativeEnum(ExpenseCategory),
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    description: z.string().min(1).max(500),
    expenseDate: z.string().transform(str => new Date(str)),
    receiptUrl: z.string().url().optional(),
    projectId: z.string().uuid().optional()
});

export type CreateExpenseData = z.infer<typeof createExpenseSchema>;

/**
 * Update expense schema
 */
const updateExpenseSchema = z.object({
    category: z.nativeEnum(ExpenseCategory).optional(),
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    description: z.string().min(1).max(500).optional(),
    expenseDate: z.string().transform(str => new Date(str)).optional(),
    receiptUrl: z.string().url().optional(),
    projectId: z.string().uuid().optional(),
    status: z.nativeEnum(ExpenseStatus).optional(),
    rejectionReason: z.string().max(500).optional()
});

export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>;

/**
 * Get expenses with filtering and pagination
 */
export async function getExpenses(query: Partial<ExpenseQuery> = {}): Promise<{
    expenses: (Expense & { user?: User; approver?: User | null; project?: { id: string; name: string } | null })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = expenseQuerySchema.parse(query);
        
        const { 
            page, 
            limit, 
            userId, 
            category, 
            status, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount, 
            sortBy, 
            sortOrder 
        } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (userId) {
            where['userId'] = userId;
        }
        
        if (category) {
            where['category'] = category;
        }
        
        if (status) {
            where['status'] = status;
        }
        
        if (startDate || endDate) {
            where['expenseDate'] = {};
            if (startDate) {
                (where['expenseDate'] as Record<string, unknown>)['gte'] = new Date(startDate);
            }
            if (endDate) {
                (where['expenseDate'] as Record<string, unknown>)['lte'] = new Date(endDate);
            }
        }
        
        if (minAmount || maxAmount) {
            where['amount'] = {};
            if (minAmount) {
                (where['amount'] as Record<string, unknown>)['gte'] = minAmount;
            }
            if (maxAmount) {
                (where['amount'] as Record<string, unknown>)['lte'] = maxAmount;
            }
        }

        // Execute queries in parallel
        const [expenses, total] = await Promise.all([
            prismaClient.expense.findMany({
                where,
                include: {
                    user: true,
                    approver: true,
                    project: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.expense.count({ where })
        ]);

        return {
            expenses,
            total,
            page: page as number,
            limit: limit as number,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get expenses error:', error);
        throw new Error('FAILED_TO_FETCH_EXPENSES');
    }
}

/**
 * Get expense by ID
 */
export async function getExpenseById(expenseId: string): Promise<(Expense & { 
    user?: User; 
    approver?: User | null;
    project?: { id: string; name: string } | null;
}) | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const expense = await prismaClient.expense.findUnique({
            where: { id: expenseId },
            include: {
                user: true,
                approver: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Get expense by ID error:', error);
        throw new Error('FAILED_TO_FETCH_EXPENSE');
    }
}

/**
 * Create a new expense
 */
export async function createExpense(expenseData: CreateExpenseData, userId: string): Promise<Expense> {
    try {
        const prismaClient = getPrismaClient();
        
        // Validate project if provided
        if (expenseData.projectId) {
            const project = await prismaClient.project.findUnique({
                where: { id: expenseData.projectId }
            });
            if (!project) {
                throw new Error('INVALID_PROJECT');
            }
        }

        const expense = await prismaClient.expense.create({
            data: {
                ...expenseData,
                userId,
                status: ExpenseStatus.SUBMITTED,
                createdAt: new Date(),
                updatedAt: new Date(),
                receiptUrl: expenseData.receiptUrl || null,
                projectId: expenseData.projectId || null
            },
            include: {
                user: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Create expense error:', error);
        if (error instanceof Error && error.message === 'INVALID_PROJECT') {
            throw error;
        }
        throw new Error('FAILED_TO_CREATE_EXPENSE');
    }
}

/**
 * Update an expense
 */
export async function updateExpense(
    expenseId: string, 
    updates: UpdateExpenseData, 
    updatedBy: string
): Promise<Expense> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if expense exists
        const existingExpense = await prismaClient.expense.findUnique({
            where: { id: expenseId }
        });

        if (!existingExpense) {
            throw new Error('EXPENSE_NOT_FOUND');
        }

        // If approving, set approver and approvedAt
        const updateData: Record<string, unknown> = {
            ...updates,
            updatedAt: new Date()
        };

        if (updates.status === ExpenseStatus.APPROVED) {
            updateData['approvedBy'] = updatedBy;
            updateData['approvedAt'] = new Date();
        }

        const expense = await prismaClient.expense.update({
            where: { id: expenseId },
            data: updateData,
            include: {
                user: true,
                approver: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Update expense error:', error);
        if (error instanceof Error && error.message === 'EXPENSE_NOT_FOUND') {
            throw error;
        }
        throw new Error('FAILED_TO_UPDATE_EXPENSE');
    }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string, userId: string): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if expense exists and belongs to user
        const expense = await prismaClient.expense.findUnique({
            where: { id: expenseId }
        });

        if (!expense) {
            throw new Error('EXPENSE_NOT_FOUND');
        }

        if (expense.userId !== userId) {
            throw new Error('UNAUTHORIZED_TO_DELETE_EXPENSE');
        }

        // Only allow deletion of draft or submitted expenses
        if (expense.status !== ExpenseStatus.DRAFT && expense.status !== ExpenseStatus.SUBMITTED) {
            throw new Error('CANNOT_DELETE_APPROVED_EXPENSE');
        }

        await prismaClient.expense.delete({
            where: { id: expenseId }
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        if (error instanceof Error && ['EXPENSE_NOT_FOUND', 'UNAUTHORIZED_TO_DELETE_EXPENSE', 'CANNOT_DELETE_APPROVED_EXPENSE'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_DELETE_EXPENSE');
    }
}

/**
 * Get expense statistics
 */
export async function getExpenseStats(userId?: string, departmentId?: string, year: number = new Date().getFullYear()): Promise<{
    totalExpenses: number;
    totalAmount: number;
    pendingExpenses: number;
    approvedExpenses: number;
    rejectedExpenses: number;
    expensesByCategory: Record<ExpenseCategory, { count: number; amount: number }>;
    monthlyExpenses: Array<{ month: string; amount: number; count: number }>;
    averageExpenseAmount: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const where: Record<string, unknown> = {
            createdAt: { gte: startOfYear, lte: endOfYear }
        };

        if (userId) {
            where['userId'] = userId;
        }

        if (departmentId) {
            where['user'] = { departmentId };
        }

        const [
            totalExpenses,
            totalAmount,
            pendingExpenses,
            approvedExpenses,
            rejectedExpenses,
            expensesByCategory,
            monthlyExpenses
        ] = await Promise.all([
            prismaClient.expense.count({ where }),
            prismaClient.expense.aggregate({
                where,
                _sum: { amount: true }
            }),
            prismaClient.expense.count({ where: { ...where, status: ExpenseStatus.SUBMITTED } }),
            prismaClient.expense.count({ where: { ...where, status: ExpenseStatus.APPROVED } }),
            prismaClient.expense.count({ where: { ...where, status: ExpenseStatus.REJECTED } }),
            prismaClient.expense.groupBy({
                by: ['category'],
                _count: { category: true },
                _sum: { amount: true },
                where
            }),
            // Get monthly expenses
            prismaClient.$queryRaw`
                SELECT 
                    TO_CHAR("expenseDate", 'YYYY-MM') as month,
                    SUM(amount) as amount,
                    COUNT(*) as count
                FROM "Expense"
                WHERE "createdAt" >= ${startOfYear} AND "createdAt" <= ${endOfYear}
                ${userId ? prismaClient.$queryRaw`AND "userId" = ${userId}` : prismaClient.$queryRaw``}
                GROUP BY TO_CHAR("expenseDate", 'YYYY-MM')
                ORDER BY month
            `
        ]);

        // Format expenses by category
        const categoryStats: Record<ExpenseCategory, { count: number; amount: number }> = {
            TRAVEL: { count: 0, amount: 0 },
            MEALS: { count: 0, amount: 0 },
            ACCOMMODATION: { count: 0, amount: 0 },
            OFFICE_SUPPLIES: { count: 0, amount: 0 },
            CLIENT_ENTERTAINMENT: { count: 0, amount: 0 },
            OTHER: { count: 0, amount: 0 }
        };

        expensesByCategory.forEach(stat => {
            categoryStats[stat.category] = {
                count: stat._count.category,
                amount: Number(stat._sum.amount || 0)
            };
        });

        const averageExpenseAmount = totalExpenses > 0 ? Number(totalAmount._sum.amount || 0) / totalExpenses : 0;

        return {
            totalExpenses,
            totalAmount: Number(totalAmount._sum.amount || 0),
            pendingExpenses,
            approvedExpenses,
            rejectedExpenses,
            expensesByCategory: categoryStats,
            monthlyExpenses: monthlyExpenses as Array<{ month: string; amount: number; count: number }>,
            averageExpenseAmount
        };
    } catch (error) {
        console.error('Get expense stats error:', error);
        throw new Error('FAILED_TO_FETCH_EXPENSE_STATS');
    }
}

/**
 * Get pending expenses for approval
 */
export async function getPendingExpenses(approverId: string): Promise<(Expense & { user?: User; project?: { id: string; name: string } | null })[]> {
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

        // Get pending expenses from users in the same department
        const expenses = await prismaClient.expense.findMany({
            where: {
                status: ExpenseStatus.SUBMITTED,
                user: {
                    departmentId: approver.departmentId
                }
            },
            include: {
                user: true,
                project: true
            },
            orderBy: { createdAt: 'asc' }
        });

        return expenses;
    } catch (error) {
        console.error('Get pending expenses error:', error);
        throw new Error('FAILED_TO_FETCH_PENDING_EXPENSES');
    }
}

/**
 * Approve an expense
 */
export async function approveExpense(expenseId: string, approverId: string): Promise<Expense> {
    try {
        const prismaClient = getPrismaClient();
        
        const expense = await prismaClient.expense.update({
            where: { id: expenseId },
            data: {
                status: ExpenseStatus.APPROVED,
                approvedBy: approverId,
                approvedAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                user: true,
                approver: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Approve expense error:', error);
        throw new Error('FAILED_TO_APPROVE_EXPENSE');
    }
}

/**
 * Reject an expense
 */
export async function rejectExpense(expenseId: string, approverId: string, rejectionReason: string): Promise<Expense> {
    try {
        const prismaClient = getPrismaClient();
        
        const expense = await prismaClient.expense.update({
            where: { id: expenseId },
            data: {
                status: ExpenseStatus.REJECTED,
                approvedBy: approverId,
                approvedAt: new Date(),
                rejectionReason,
                updatedAt: new Date()
            },
            include: {
                user: true,
                approver: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Reject expense error:', error);
        throw new Error('FAILED_TO_REJECT_EXPENSE');
    }
}

/**
 * Mark expense as reimbursed
 */
export async function markExpenseAsReimbursed(expenseId: string, _reimbursedBy: string): Promise<Expense> {
    try {
        const prismaClient = getPrismaClient();
        
        const expense = await prismaClient.expense.update({
            where: { id: expenseId },
            data: {
                status: ExpenseStatus.REIMBURSED,
                updatedAt: new Date()
            },
            include: {
                user: true,
                approver: true,
                project: true
            }
        });

        return expense;
    } catch (error) {
        console.error('Mark expense as reimbursed error:', error);
        throw new Error('FAILED_TO_MARK_EXPENSE_REIMBURSED');
    }
}
