import { createClient, RedisClientType } from 'redis';
import { config } from '../config/environment';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: config.redis.url,
      ...(config.redis.password && { password: config.redis.password })
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw new Error('REDIS_CONNECTION_FAILED');
  }
}

/**
 * Get Redis client instance
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    return await initializeRedis();
  }
  return redisClient;
}

/**
 * Store refresh token in Redis
 */
export async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const key = `refresh_token:${userId}:${refreshToken}`;
    
    // Store with 7 days expiration (same as JWT refresh token)
    await client.setEx(key, 7 * 24 * 60 * 60, 'valid');
    
    // Also maintain a set of all refresh tokens for this user
    const userTokensKey = `user_refresh_tokens:${userId}`;
    await client.sAdd(userTokensKey, refreshToken);
    await client.expire(userTokensKey, 7 * 24 * 60 * 60);
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw new Error('REDIS_STORE_FAILED');
  }
}

/**
 * Validate refresh token exists in Redis
 */
export async function validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = `refresh_token:${userId}:${refreshToken}`;
    const result = await client.get(key);
    return result === 'valid';
  } catch (error) {
    console.error('Error validating refresh token:', error);
    return false;
  }
}

/**
 * Remove specific refresh token from Redis
 */
export async function removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const key = `refresh_token:${userId}:${refreshToken}`;
    
    await client.del(key);
    
    // Remove from user's token set
    const userTokensKey = `user_refresh_tokens:${userId}`;
    await client.sRem(userTokensKey, refreshToken);
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw new Error('REDIS_REMOVE_FAILED');
  }
}

/**
 * Remove all refresh tokens for a user
 */
export async function removeAllRefreshTokens(userId: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const userTokensKey = `user_refresh_tokens:${userId}`;
    
    // Get all refresh tokens for this user
    const tokens = await client.sMembers(userTokensKey);
    
    // Delete each token
    const deletePromises = tokens.map(token => {
      const key = `refresh_token:${userId}:${token}`;
      return client.del(key);
    });
    
    await Promise.all(deletePromises);
    
    // Delete the user's token set
    await client.del(userTokensKey);
  } catch (error) {
    console.error('Error removing all refresh tokens:', error);
    throw new Error('REDIS_REMOVE_ALL_FAILED');
  }
}

/**
 * Replace old refresh token with new one
 */
export async function replaceRefreshToken(
  userId: string, 
  oldToken: string, 
  newToken: string
): Promise<void> {
  try {
    // Remove old token
    await removeRefreshToken(userId, oldToken);
    
    // Store new token
    await storeRefreshToken(userId, newToken);
  } catch (error) {
    console.error('Error replacing refresh token:', error);
    throw new Error('REDIS_REPLACE_FAILED');
  }
}

/**
 * Store password reset token in Redis
 */
export async function storePasswordResetToken(userId: string, resetToken: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const key = `password_reset:${userId}:${resetToken}`;
    
    // Store with 1 hour expiration
    await client.setEx(key, 60 * 60, 'valid');
  } catch (error) {
    console.error('Error storing password reset token:', error);
    throw new Error('REDIS_STORE_RESET_TOKEN_FAILED');
  }
}

/**
 * Validate password reset token exists in Redis
 */
export async function validatePasswordResetToken(userId: string, resetToken: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = `password_reset:${userId}:${resetToken}`;
    const result = await client.get(key);
    return result === 'valid';
  } catch (error) {
    console.error('Error validating password reset token:', error);
    return false;
  }
}

/**
 * Remove password reset token from Redis
 */
export async function removePasswordResetToken(userId: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const pattern = `password_reset:${userId}:*`;
    
    // Get all keys matching the pattern
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Error removing password reset token:', error);
    throw new Error('REDIS_REMOVE_RESET_TOKEN_FAILED');
  }
}

/**
 * Cleanup expired tokens (maintenance function)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const client = await getRedisClient();
    
    // Redis automatically handles expiration, but we can clean up orphaned user token sets
    const userTokenKeys = await client.keys('user_refresh_tokens:*');
    
    for (const userTokenKey of userTokenKeys) {
      const tokens = await client.sMembers(userTokenKey);
      const validTokens: string[] = [];
      
      // Check each token to see if it still exists
      for (const token of tokens) {
        const userId = userTokenKey.split(':')[1];
        const tokenKey = `refresh_token:${userId}:${token}`;
        const exists = await client.exists(tokenKey);
        
        if (exists) {
          validTokens.push(token);
        }
      }
      
      // Update the set with only valid tokens
      if (validTokens.length === 0) {
        await client.del(userTokenKey);
      } else if (validTokens.length !== tokens.length) {
        await client.del(userTokenKey);
        if (validTokens.length > 0) {
          await client.sAdd(userTokenKey, validTokens);
          await client.expire(userTokenKey, 7 * 24 * 60 * 60);
        }
      }
    }
  } catch (error) {
    console.error('Error during token cleanup:', error);
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}