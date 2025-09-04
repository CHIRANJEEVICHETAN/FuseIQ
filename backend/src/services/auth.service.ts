import { PrismaClient, User, UserRole } from '@prisma/client';
import * as JwtUtil from '../utils/jwt.util';
import * as PasswordUtil from '../utils/password.util';
import * as EmailService from './email.service';
import * as RedisService from './redis.service';
import {
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePasswordRequest
} from '../types/auth.types';

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
 * Register a new user
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
        const prismaClient = getPrismaClient();
        
        // Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('USER_ALREADY_EXISTS');
        }

        // Validate password strength
        const passwordValidation = PasswordUtil.validatePasswordStrength(userData.password);
        if (!passwordValidation.isValid) {
            throw new Error(`WEAK_PASSWORD: ${passwordValidation.errors.join(', ')}`);
        }

        // Hash password
        const hashedPassword = await PasswordUtil.hashPassword(userData.password);

        // Validate department if provided
        if (userData.departmentId) {
            const department = await prismaClient.department.findUnique({
                where: { id: userData.departmentId }
            });
            if (!department) {
                throw new Error('INVALID_DEPARTMENT');
            }
        }

        // Create user
        const user = await prismaClient.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                fullName: userData.fullName,
                ...(userData.phone && { phone: userData.phone }),
                ...(userData.position && { position: userData.position }),
                ...(userData.departmentId && { departmentId: userData.departmentId }),
                role: UserRole.EMPLOYEE, // Default role
                isActive: true
            },
            include: {
                department: true
            }
        });

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = JwtUtil.generateAccessToken(tokenPayload);
        const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        // Store refresh token in Redis
        await RedisService.storeRefreshToken(user.id, refreshToken);

        // Send welcome email
        try {
            await EmailService.sendWelcomeEmail(user.email, user.fullName || 'User');
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            // Don't fail registration if email fails
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName || '',
                role: user.role,
                ...(user.departmentId && { departmentId: user.departmentId })
            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
        const prismaClient = getPrismaClient();
        
        // Find user by email
        const user = await prismaClient.user.findUnique({
            where: { email: credentials.email },
            include: {
                department: true
            }
        });

        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('ACCOUNT_DEACTIVATED');
        }

        // Verify password
        const isPasswordValid = await PasswordUtil.comparePassword(
            credentials.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = JwtUtil.generateAccessToken(tokenPayload);
        const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        // Store refresh token in Redis
        await RedisService.storeRefreshToken(user.id, refreshToken);

        // Update last login
        await prismaClient.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName || '',
                role: user.role,
                ...(user.departmentId && { departmentId: user.departmentId })
            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout user
 */
export async function logout(userId: string, refreshToken?: string): Promise<void> {
    try {
        // Remove refresh token from Redis
        if (refreshToken) {
            await RedisService.removeRefreshToken(userId, refreshToken);
        } else {
            // Remove all refresh tokens for user
            await RedisService.removeAllRefreshTokens(userId);
        }
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
        const prismaClient = getPrismaClient();
        
        // Verify refresh token
        const payload = JwtUtil.verifyRefreshToken(refreshToken);

        // Check if refresh token exists in Redis
        const isValidToken = await RedisService.validateRefreshToken(
            payload.userId,
            refreshToken
        );

        if (!isValidToken) {
            throw new Error('INVALID_REFRESH_TOKEN');
        }

        // Get user data
        const user = await prismaClient.user.findUnique({
            where: { id: payload.userId },
            include: {
                department: true
            }
        });

        if (!user || !user.isActive) {
            throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        // Generate new tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const newAccessToken = JwtUtil.generateAccessToken(tokenPayload);
        const newRefreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        // Replace old refresh token with new one
        await RedisService.replaceRefreshToken(
            user.id,
            refreshToken,
            newRefreshToken
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName || '',
                role: user.role,
                ...(user.departmentId && { departmentId: user.departmentId })
            },
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Find user by email
        const user = await prismaClient.user.findUnique({
            where: { email: request.email }
        });

        if (!user) {
            // Don't reveal if email exists or not for security
            console.log(`Password reset requested for non-existent email: ${request.email}`);
            return;
        }

        if (!user.isActive) {
            throw new Error('ACCOUNT_DEACTIVATED');
        }

        // Generate password reset token
        const resetToken = JwtUtil.generatePasswordResetToken(user.id, user.email);

        // Store reset token in Redis with expiration
        await RedisService.storePasswordResetToken(user.id, resetToken);

        // Send password reset email
        await EmailService.sendPasswordResetEmail(
            user.email,
            resetToken,
            user.fullName || 'User'
        );

        console.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
        console.error('Password reset request error:', error);
        throw error;
    }
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(request: PasswordResetConfirm): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Verify reset token
        const payload = JwtUtil.verifyPasswordResetToken(request.token);

        // Check if reset token exists in Redis
        const isValidToken = await RedisService.validatePasswordResetToken(
            payload.userId,
            request.token
        );

        if (!isValidToken) {
            throw new Error('INVALID_OR_EXPIRED_RESET_TOKEN');
        }

        // Validate new password strength
        const passwordValidation = PasswordUtil.validatePasswordStrength(request.newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(`WEAK_PASSWORD: ${passwordValidation.errors.join(', ')}`);
        }

        // Get user
        const user = await prismaClient.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user || !user.isActive) {
            throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        // Hash new password
        const hashedPassword = await PasswordUtil.hashPassword(request.newPassword);

        // Update user password
        await prismaClient.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });

        // Remove reset token from Redis
        await RedisService.removePasswordResetToken(user.id);

        // Invalidate all refresh tokens for security
        await RedisService.removeAllRefreshTokens(user.id);

        // Send confirmation email
        try {
            await EmailService.sendPasswordChangeConfirmation(
                user.email,
                user.fullName || 'User'
            );
        } catch (error) {
            console.error('Failed to send password change confirmation:', error);
            // Don't fail the operation if email fails
        }

        console.log(`Password reset completed for user: ${user.email}`);
    } catch (error) {
        console.error('Password reset confirmation error:', error);
        throw error;
    }
}

/**
 * Change password (for authenticated users)
 */
export async function changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    try {
        const prismaClient = getPrismaClient();
        
        // Get user
        const user = await prismaClient.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.isActive) {
            throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        // Verify current password
        const isCurrentPasswordValid = await PasswordUtil.comparePassword(
            request.currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            throw new Error('INVALID_CURRENT_PASSWORD');
        }

        // Validate new password strength
        const passwordValidation = PasswordUtil.validatePasswordStrength(request.newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(`WEAK_PASSWORD: ${passwordValidation.errors.join(', ')}`);
        }

        // Check if new password is different from current
        const isSamePassword = await PasswordUtil.comparePassword(
            request.newPassword,
            user.password
        );

        if (isSamePassword) {
            throw new Error('NEW_PASSWORD_SAME_AS_CURRENT');
        }

        // Hash new password
        const hashedPassword = await PasswordUtil.hashPassword(request.newPassword);

        // Update user password
        await prismaClient.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });

        // Invalidate all refresh tokens except current session for security
        // This forces re-login on other devices
        await RedisService.removeAllRefreshTokens(userId);

        // Send confirmation email
        try {
            await EmailService.sendPasswordChangeConfirmation(
                user.email,
                user.fullName || 'User'
            );
        } catch (error) {
            console.error('Failed to send password change confirmation:', error);
            // Don't fail the operation if email fails
        }

        console.log(`Password changed for user: ${user.email}`);
    } catch (error) {
        console.error('Password change error:', error);
        throw error;
    }
}

/**
 * Verify user token and get user data
 */
export async function verifyToken(token: string): Promise<User> {
    try {
        const prismaClient = getPrismaClient();
        
        // Verify JWT token
        const payload = JwtUtil.verifyAccessToken(token);

        // Get user data
        const user = await prismaClient.user.findUnique({
            where: { id: payload.userId },
            include: {
                department: true
            }
        });

        if (!user || !user.isActive) {
            throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        return user;
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const prismaClient = getPrismaClient();
        return await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                department: true
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        throw error;
    }
}

/**
 * Cleanup expired tokens (should be called periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
    try {
        await RedisService.cleanupExpiredTokens();
        console.log('Expired tokens cleanup completed');
    } catch (error) {
        console.error('Token cleanup error:', error);
    }
}