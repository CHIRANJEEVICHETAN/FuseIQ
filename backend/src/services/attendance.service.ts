import { PrismaClient, Attendance, User, AttendanceStatus } from '@prisma/client';
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
 * Attendance query schema for filtering and pagination
 */
const attendanceQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    userId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['present', 'absent', 'late', 'half_day', 'work_from_home']).optional(),
    sortBy: z.enum(['date', 'clockIn', 'clockOut']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;

/**
 * Clock in/out schema
 */
const clockInSchema = z.object({
    location: z.string().max(200).optional(),
    notes: z.string().max(500).optional()
});

const clockOutSchema = z.object({
    notes: z.string().max(500).optional()
});

export type ClockInRequest = z.infer<typeof clockInSchema>;
export type ClockOutRequest = z.infer<typeof clockOutSchema>;

/**
 * Get attendance records with filtering and pagination
 */
export async function getAttendanceRecords(query: Partial<AttendanceQuery> = {}): Promise<{
    records: (Attendance & { user?: User })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        const validatedQuery = attendanceQuerySchema.parse(query);
        
        const { page, limit, userId, startDate, endDate, status, sortBy, sortOrder } = validatedQuery;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (userId) {
            where['userId'] = userId;
        }
        
        if (startDate || endDate) {
            where['date'] = {};
            if (startDate) {
                (where['date'] as Record<string, unknown>)['gte'] = new Date(startDate);
            }
            if (endDate) {
                (where['date'] as Record<string, unknown>)['lte'] = new Date(endDate);
            }
        }
        
        if (status) {
            where['status'] = status;
        }

        // Execute queries in parallel
        const [records, total] = await Promise.all([
            prismaClient.attendance.findMany({
                where,
                include: {
                    user: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prismaClient.attendance.count({ where })
        ]);

        return {
            records,
            total,
            page: page as number,
            limit: limit as number,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Get attendance records error:', error);
        throw new Error('FAILED_TO_FETCH_ATTENDANCE_RECORDS');
    }
}

/**
 * Get today's attendance for a user
 */
export async function getTodayAttendance(userId: string): Promise<Attendance | null> {
    try {
        const prismaClient = getPrismaClient();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await prismaClient.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        return attendance;
    } catch (error) {
        console.error('Get today attendance error:', error);
        throw new Error('FAILED_TO_FETCH_TODAY_ATTENDANCE');
    }
}

/**
 * Clock in for a user
 */
export async function clockIn(userId: string, clockInData: ClockInRequest): Promise<Attendance> {
    try {
        const prismaClient = getPrismaClient();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if user already clocked in today
        const existingAttendance = await prismaClient.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        if (existingAttendance && existingAttendance.clockIn) {
            throw new Error('ALREADY_CLOCKED_IN');
        }

        const now = new Date();
        
        // Determine if user is late (assuming 9 AM is standard start time)
        const standardStartTime = new Date(today);
        standardStartTime.setHours(9, 0, 0, 0);
        
        const status = now > standardStartTime ? 'late' : 'present';

        const attendance = await prismaClient.attendance.upsert({
            where: {
                id: existingAttendance?.id || 'temp-id'
            },
            update: {
                clockIn: now,
                status: status as AttendanceStatus,
                location: clockInData.location || null,
                notes: clockInData.notes || null,
                updatedAt: new Date()
            },
            create: {
                userId,
                date: today,
                clockIn: now,
                status: status as AttendanceStatus,
                location: clockInData.location || null,
                notes: clockInData.notes || null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return attendance;
    } catch (error) {
        console.error('Clock in error:', error);
        if (error instanceof Error && error.message === 'ALREADY_CLOCKED_IN') {
            throw error;
        }
        throw new Error('FAILED_TO_CLOCK_IN');
    }
}

/**
 * Clock out for a user
 */
export async function clockOut(userId: string, clockOutData: ClockOutRequest): Promise<Attendance> {
    try {
        const prismaClient = getPrismaClient();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find today's attendance record
        const attendance = await prismaClient.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        if (!attendance) {
            throw new Error('NO_CLOCK_IN_RECORD');
        }

        if (!attendance.clockIn) {
            throw new Error('NOT_CLOCKED_IN');
        }

        if (attendance.clockOut) {
            throw new Error('ALREADY_CLOCKED_OUT');
        }

        const now = new Date();
        
        // Calculate total hours worked
        const clockInTime = new Date(attendance.clockIn);
        const totalMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));
        const breakMinutes = attendance.breakDurationMinutes || 0;
        const totalHours = (totalMinutes - breakMinutes) / 60;

        const updatedAttendance = await prismaClient.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: now,
                totalHours,
                notes: clockOutData.notes || attendance.notes,
                updatedAt: new Date()
            }
        });

        return updatedAttendance;
    } catch (error) {
        console.error('Clock out error:', error);
        if (error instanceof Error && ['NO_CLOCK_IN_RECORD', 'NOT_CLOCKED_IN', 'ALREADY_CLOCKED_OUT'].includes(error.message)) {
            throw error;
        }
        throw new Error('FAILED_TO_CLOCK_OUT');
    }
}

/**
 * Get attendance history for a user
 */
export async function getAttendanceHistory(userId: string, limit: number = 30): Promise<Attendance[]> {
    try {
        const prismaClient = getPrismaClient();
        
        const records = await prismaClient.attendance.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: limit
        });

        return records;
    } catch (error) {
        console.error('Get attendance history error:', error);
        throw new Error('FAILED_TO_FETCH_ATTENDANCE_HISTORY');
    }
}

/**
 * Get attendance statistics for a user
 */
export async function getAttendanceStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    averageHoursPerDay: number;
    attendanceRate: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const where: Record<string, unknown> = { userId };
        
        if (startDate || endDate) {
            where['date'] = {};
            if (startDate) {
                (where['date'] as Record<string, unknown>)['gte'] = startDate;
            }
            if (endDate) {
                (where['date'] as Record<string, unknown>)['lte'] = endDate;
            }
        }

        const records = await prismaClient.attendance.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        const totalDays = records.length;
        const presentDays = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absentDays = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const lateDays = records.filter(r => r.status === AttendanceStatus.LATE).length;
        const totalHours = records.reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
        const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
        const attendanceRate = totalDays > 0 ? (presentDays + lateDays) / totalDays * 100 : 0;

        return {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            totalHours,
            averageHoursPerDay,
            attendanceRate
        };
    } catch (error) {
        console.error('Get attendance stats error:', error);
        throw new Error('FAILED_TO_FETCH_ATTENDANCE_STATS');
    }
}

/**
 * Update attendance record (admin only)
 */
export async function updateAttendanceRecord(
    attendanceId: string, 
    updates: {
        clockIn?: Date;
        clockOut?: Date;
        status?: string;
        location?: string;
        notes?: string;
        breakDurationMinutes?: number;
        totalHours?: number;
    },
    _updatedBy: string
): Promise<Attendance> {
    try {
        const prismaClient = getPrismaClient();
        
        const updateData: Record<string, unknown> = {
            updatedAt: new Date()
        };

        if (updates.clockIn !== undefined) updateData['clockIn'] = updates.clockIn;
        if (updates.clockOut !== undefined) updateData['clockOut'] = updates.clockOut;
        if (updates.status !== undefined) updateData['status'] = updates.status;
        if (updates.location !== undefined) updateData['location'] = updates.location;
        if (updates.notes !== undefined) updateData['notes'] = updates.notes;
        if (updates.breakDurationMinutes !== undefined) updateData['breakDurationMinutes'] = updates.breakDurationMinutes;
        if (updates.totalHours !== undefined) updateData['totalHours'] = updates.totalHours;

        const attendance = await prismaClient.attendance.update({
            where: { id: attendanceId },
            data: updateData
        });

        return attendance;
    } catch (error) {
        console.error('Update attendance record error:', error);
        throw new Error('FAILED_TO_UPDATE_ATTENDANCE_RECORD');
    }
}

/**
 * Get department attendance summary
 */
export async function getDepartmentAttendanceSummary(departmentId: string, date: Date): Promise<{
    totalEmployees: number;
    presentEmployees: number;
    absentEmployees: number;
    lateEmployees: number;
    averageHours: number;
}> {
    try {
        const prismaClient = getPrismaClient();
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all employees in the department
        const employees = await prismaClient.user.findMany({
            where: {
                departmentId,
                isActive: true
            }
        });

        const employeeIds = employees.map(emp => emp.id);

        // Get attendance records for the day
        const attendanceRecords = await prismaClient.attendance.findMany({
            where: {
                userId: { in: employeeIds },
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        const totalEmployees = employees.length;
        const presentEmployees = attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absentEmployees = totalEmployees - attendanceRecords.length;
        const lateEmployees = attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length;
        const totalHours = attendanceRecords.reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
        const averageHours = attendanceRecords.length > 0 ? totalHours / attendanceRecords.length : 0;

        return {
            totalEmployees,
            presentEmployees,
            absentEmployees,
            lateEmployees,
            averageHours
        };
    } catch (error) {
        console.error('Get department attendance summary error:', error);
        throw new Error('FAILED_TO_FETCH_DEPARTMENT_ATTENDANCE_SUMMARY');
    }
}
