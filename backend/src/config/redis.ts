import { createClient, RedisClientType } from 'redis';
import { config } from './environment';

export class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  /**
   * Initialize Redis connection with configuration
   */
  public async connect(): Promise<void> {
    try {
      const redisOptions = {
        url: config.redis.url,
        ...(config.redis.password && { password: config.redis.password }),
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries: number) => {
            if (retries >= this.maxReconnectAttempts) {
              console.error('❌ Redis: Maximum reconnection attempts reached');
              return false;
            }
            const delay = Math.min(this.reconnectDelay * Math.pow(2, retries), 30000);
            console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries + 1}/${this.maxReconnectAttempts})`);
            return delay;
          }
        }
      };

      this.client = createClient(redisOptions);

      // Event listeners for connection management
      this.client.on('connect', () => {
        console.log('🔄 Redis: Connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Connected and ready');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('error', (error: Error) => {
        console.error('❌ Redis Error:', error.message);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis: Connection ended');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        console.log(`🔄 Redis: Reconnecting... (attempt ${this.reconnectAttempts})`);
      });

      // Connect to Redis
      await this.client.connect();

    } catch (error) {
      console.error('❌ Redis: Failed to connect:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Get Redis client instance
   */
  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  public isRedisConnected(): boolean {
    return this.isConnected && this.client?.isReady === true;
  }

  /**
   * Health check for Redis connection
   */
  public async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    try {
      if (!this.client || !this.isConnected) {
        return {
          status: 'disconnected',
          error: 'Redis client not connected'
        };
      }

      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gracefully disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        console.log('✅ Redis: Disconnected gracefully');
      }
    } catch (error) {
      console.error('❌ Redis: Error during disconnect:', error);
    } finally {
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Force disconnect (for emergency situations)
   */
  public async forceDisconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        console.log('⚠️ Redis: Force disconnected');
      }
    } catch (error) {
      console.error('❌ Redis: Error during force disconnect:', error);
    } finally {
      this.isConnected = false;
      this.client = null;
    }
  }
}

// Export singleton instance
export const redisManager = RedisManager.getInstance();

// Export client getter for convenience
export const getRedisClient = (): RedisClientType => {
  return redisManager.getClient();
};