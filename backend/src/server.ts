import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { config } from './config/environment';
import { checkDatabaseConnection, disconnectDatabase } from './config/database';
import { redisManager } from './config/redis';
import { createSessionStore, sessionConfig, sessionActivityMiddleware } from './config/session';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import expenseRoutes from './routes/expense.routes';
import projectRoutes from './routes/project.routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - allow all localhost origins for development
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
  // Allow any localhost with any port for development
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  // Allow local network IPs for development
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (will be configured after Redis connection)
let sessionMiddleware: ReturnType<typeof session> | null = null;

// Health check routes
app.use('/', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Check database connection on startup
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize Redis connection
    console.log('🔄 Connecting to Redis...');
    await redisManager.connect();
    
    // Configure session store with Redis
    const sessionStore = createSessionStore();
    sessionConfig.store = sessionStore;
    
    // Apply session middleware
    sessionMiddleware = session(sessionConfig);
    app.use(sessionMiddleware);
    
    // Apply session activity tracking middleware
    app.use(sessionActivityMiddleware);

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🗄️  Database health: http://localhost:${config.port}/health/database`);
      console.log(`🔴 Redis health: http://localhost:${config.port}/health/redis`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  await Promise.all([
    disconnectDatabase(),
    redisManager.disconnect()
  ]);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  await Promise.all([
    disconnectDatabase(),
    redisManager.disconnect()
  ]);
  process.exit(0);
});

// Start the server
startServer();

export default app;