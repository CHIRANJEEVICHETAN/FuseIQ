import session from "express-session";
import RedisStore from "connect-redis";
import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "./redis";
import { config } from "./environment";
import { RedisSessionData } from "../types/session.types";

/**
 * Redis session store configuration
 */
export const createSessionStore = () => {
  const redisClient = getRedisClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (RedisStore as any)({
    client: redisClient,
    prefix: "sess:",
    ttl: 24 * 60 * 60, // 24 hours in seconds
    disableTouch: false, // Enable session touch to extend TTL
    disableTTL: false,
  });
};

/**
 * Express session configuration
 */
export const sessionConfig: session.SessionOptions = {
  store: undefined, // Will be set when Redis is connected
  secret: config.jwt.secret,
  name: "evolve-sync-session",
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: config.nodeEnv === "production", // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sameSite: config.nodeEnv === "production" ? "strict" : "lax",
  },
};

/**
 * Session data interface (re-export for convenience)
 */
export type SessionData = RedisSessionData;

/**
 * Extended request interface with session
 */
interface RequestWithSession extends Request {
  session: session.Session & {
    user?: SessionData;
  };
}

/**
 * Create a new session
 */
export async function createSession(
  req: RequestWithSession,
  userData: {
    userId: string;
    email: string;
    role: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const sessionData: SessionData = {
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
    loginTime: Date.now(),
    lastActivity: Date.now(),
    ...(userData.ipAddress && { ipAddress: userData.ipAddress }),
    ...(userData.userAgent && { userAgent: userData.userAgent }),
  };

  req.session.user = sessionData;
}

/**
 * Update session activity
 */
export async function updateSessionActivity(
  req: RequestWithSession
): Promise<void> {
  if (req.session?.user) {
    req.session.user.lastActivity = Date.now();
  }
}

/**
 * Get session data
 */
export function getSessionData(req: RequestWithSession): SessionData | null {
  return req.session?.user || null;
}

/**
 * Destroy session
 */
export async function destroySession(req: RequestWithSession): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Check if session is valid and not expired
 */
export function isSessionValid(
  sessionData: SessionData,
  maxInactiveTime: number = 30 * 60 * 1000
): boolean {
  if (!sessionData) return false;

  const now = Date.now();
  const timeSinceLastActivity = now - sessionData.lastActivity;

  return timeSinceLastActivity < maxInactiveTime;
}

/**
 * Get session duration
 */
export function getSessionDuration(sessionData: SessionData): number {
  if (!sessionData) return 0;
  return Date.now() - sessionData.loginTime;
}

/**
 * Check if user has permission based on role
 */
export function hasSessionPermission(
  sessionData: SessionData | null,
  requiredRoles: string[]
): boolean {
  if (!sessionData) return false;
  return requiredRoles.includes(sessionData.role);
}

/**
 * Session middleware for activity tracking
 */
export const sessionActivityMiddleware = (
  req: RequestWithSession,
  _res: Response,
  next: NextFunction
): void => {
  if (req.session?.user) {
    updateSessionActivity(req);
  }
  next();
};

/**
 * Session validation middleware
 */
export const validateSessionMiddleware = (maxInactiveTime?: number) => {
  return (req: RequestWithSession, res: Response, next: NextFunction): void => {
    const sessionData = getSessionData(req);

    if (sessionData && !isSessionValid(sessionData, maxInactiveTime)) {
      // Session expired, destroy it
      destroySession(req).catch(console.error);
      res.status(401).json({
        success: false,
        error: {
          code: "SESSION_EXPIRED",
          message: "Session has expired due to inactivity",
        },
      });
      return;
    }

    next();
  };
};

/**
 * Role-based access control middleware using sessions
 */
export const requireSessionRole = (requiredRoles: string[]) => {
  return (req: RequestWithSession, res: Response, next: NextFunction): void => {
    const sessionData = getSessionData(req);

    if (!hasSessionPermission(sessionData, requiredRoles)) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Insufficient permissions to access this resource",
        },
      });
      return;
    }

    next();
  };
};
