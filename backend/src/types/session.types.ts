import 'express-session';

// Extend the session data interface
declare module 'express-session' {
  interface SessionData {
    user?: {
      userId: string;
      email: string;
      role: string;
      loginTime: number;
      lastActivity: number;
      ipAddress?: string;
      userAgent?: string;
    };
  }
}

export interface RedisSessionData {
  userId: string;
  email: string;
  role: string;
  loginTime: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  loginTime: Date;
  lastActivity: Date;
  duration: number;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  userSessions: Record<string, number>;
  averageSessionDuration: number;
  oldestSession?: SessionInfo;
  newestSession?: SessionInfo;
}