import { PrismaClient } from '@prisma/client';
import { config } from './environment';

// Module-level variable to store the Prisma client instance
let prismaClient: PrismaClient | undefined;

const createPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
      log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
};

/**
 * Check database connection
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = createPrismaClient();
    await client.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (prismaClient) {
      await prismaClient.$disconnect();
      prismaClient = undefined;
      console.log('✅ Database disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

/**
 * Execute database operations within a transaction
 */
export const withTransaction = async <T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> => {
  const client = createPrismaClient();
  return await client.$transaction(callback);
};