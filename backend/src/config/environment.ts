import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:8080',

  // Database Configuration
  databaseUrl: process.env['DATABASE_URL'] || '',

  // Redis Configuration
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    password: process.env['REDIS_PASSWORD'] || ''
  },

  // JWT Configuration
  jwt: {
    secret: process.env['JWT_SECRET'] || 'fallback-secret-change-in-production',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret-change-in-production',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
  },

  // Email Configuration
  email: {
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
    user: process.env['SMTP_USER'] || '',
    pass: process.env['SMTP_PASS'] || '',
    from: process.env['FROM_EMAIL'] || 'noreply@evolve-sync.com'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
    uploadPath: process.env['UPLOAD_PATH'] || './uploads'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10)
  }
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}