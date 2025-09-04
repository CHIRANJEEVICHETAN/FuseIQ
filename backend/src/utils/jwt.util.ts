import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { JwtPayload } from '../types/auth.types';

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'evolve-sync',
    audience: 'evolve-sync-users'
  } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'evolve-sync',
    audience: 'evolve-sync-users'
  } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'evolve-sync',
      audience: 'evolve-sync-users'
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('ACCESS_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_ACCESS_TOKEN');
    }
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'evolve-sync',
      audience: 'evolve-sync-users'
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'password_reset' },
    config.jwt.secret,
    {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: 'evolve-sync',
      audience: 'evolve-sync-password-reset'
    }
  );
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: string; email: string } {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: 'evolve-sync',
      audience: 'evolve-sync-password-reset'
    }) as JwtPayload & { type: string };

    if (payload.type !== 'password_reset') {
      throw new Error('INVALID_TOKEN_TYPE');
    }

    return {
      userId: payload.userId,
      email: payload.email
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('RESET_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_RESET_TOKEN');
    }
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}