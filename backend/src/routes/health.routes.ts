import { Router, Request, Response } from 'express';
import { redisManager } from '../config/redis';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Overall health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthChecks = await Promise.allSettled([
      // Database health check
      prisma.$queryRaw`SELECT 1`,
      
      // Redis health check
      redisManager.healthCheck(),
    ]);

    const dbHealth = healthChecks[0];
    const redisHealth = healthChecks[1];

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          error: dbHealth.status === 'rejected' ? dbHealth.reason?.message : undefined
        },
        redis: dbHealth.status === 'fulfilled' && redisHealth.status === 'fulfilled' 
          ? redisHealth.value 
          : {
              status: 'unhealthy',
              error: redisHealth.status === 'rejected' ? redisHealth.reason?.message : 'Unknown error'
            }
      }
    };

    // Determine overall status
    const allHealthy = response.services.database.status === 'healthy' && 
                      response.services.redis.status === 'healthy';
    
    if (!allHealthy) {
      response.status = 'degraded';
    }

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Database-specific health check
 */
router.get('/health/database', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'database'
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Redis-specific health check
 */
router.get('/health/redis', async (_req: Request, res: Response) => {
  try {
    const healthResult = await redisManager.healthCheck();
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      ...healthResult,
      timestamp: new Date().toISOString(),
      service: 'redis'
    });
  } catch (error) {
    console.error('Redis health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'redis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Readiness probe (for Kubernetes/Docker)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    const [dbCheck, redisCheck] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redisManager.healthCheck()
    ]);

    const dbReady = dbCheck.status === 'fulfilled';
    const redisReady = redisCheck.status === 'fulfilled' && 
                      (redisCheck.value as { status: string }).status === 'healthy';

    if (dbReady && redisReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        services: {
          database: dbReady ? 'ready' : 'not_ready',
          redis: redisReady ? 'ready' : 'not_ready'
        }
      });
    }
  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Liveness probe (for Kubernetes/Docker)
 */
router.get('/live', (_req: Request, res: Response) => {
  // Simple liveness check - if the server can respond, it's alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;