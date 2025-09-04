import { getRedisClient } from '../config/redis';

export class RedisUtil {
  /**
   * Set a key-value pair with optional expiration
   */
  static async set(key: string, value: string | object, expirationSeconds?: number): Promise<void> {
    const client = getRedisClient();
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (expirationSeconds) {
      await client.setEx(key, expirationSeconds, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  }

  /**
   * Get a value by key
   */
  static async get(key: string): Promise<string | null> {
    const client = getRedisClient();
    return await client.get(key);
  }

  /**
   * Get and parse JSON value by key
   */
  static async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  static async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.del(key);
    return result > 0;
  }

  /**
   * Delete multiple keys
   */
  static async deleteMultiple(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    const client = getRedisClient();
    return await client.del(keys);
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration for a key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.expire(key, seconds);
    return result === true;
  }

  /**
   * Get time to live for a key
   */
  static async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    return await client.ttl(key);
  }

  /**
   * Get all keys matching a pattern
   */
  static async keys(pattern: string): Promise<string[]> {
    const client = getRedisClient();
    return await client.keys(pattern);
  }

  /**
   * Increment a numeric value
   */
  static async increment(key: string, by: number = 1): Promise<number> {
    const client = getRedisClient();
    return await client.incrBy(key, by);
  }

  /**
   * Decrement a numeric value
   */
  static async decrement(key: string, by: number = 1): Promise<number> {
    const client = getRedisClient();
    return await client.decrBy(key, by);
  }

  /**
   * Add items to a set
   */
  static async addToSet(key: string, ...members: string[]): Promise<number> {
    const client = getRedisClient();
    return await client.sAdd(key, members);
  }

  /**
   * Remove items from a set
   */
  static async removeFromSet(key: string, ...members: string[]): Promise<number> {
    const client = getRedisClient();
    return await client.sRem(key, members);
  }

  /**
   * Check if item is in set
   */
  static async isInSet(key: string, member: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.sIsMember(key, member);
    return result === true;
  }

  /**
   * Get all members of a set
   */
  static async getSetMembers(key: string): Promise<string[]> {
    const client = getRedisClient();
    return await client.sMembers(key);
  }

  /**
   * Push items to a list (left side)
   */
  static async pushToList(key: string, ...items: string[]): Promise<number> {
    const client = getRedisClient();
    return await client.lPush(key, items);
  }

  /**
   * Pop item from list (left side)
   */
  static async popFromList(key: string): Promise<string | null> {
    const client = getRedisClient();
    return await client.lPop(key);
  }

  /**
   * Get list length
   */
  static async getListLength(key: string): Promise<number> {
    const client = getRedisClient();
    return await client.lLen(key);
  }

  /**
   * Get range of items from list
   */
  static async getListRange(key: string, start: number = 0, end: number = -1): Promise<string[]> {
    const client = getRedisClient();
    return await client.lRange(key, start, end);
  }

  /**
   * Set hash field
   */
  static async setHashField(key: string, field: string, value: string | object): Promise<void> {
    const client = getRedisClient();
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.hSet(key, field, serializedValue);
  }

  /**
   * Get hash field
   */
  static async getHashField(key: string, field: string): Promise<string | null> {
    const client = getRedisClient();
    const result = await client.hGet(key, field);
    return result || null;
  }

  /**
   * Get hash field as JSON
   */
  static async getHashFieldJSON<T>(key: string, field: string): Promise<T | null> {
    const value = await this.getHashField(key, field);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for hash ${key}.${field}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields and values
   */
  static async getAllHashFields(key: string): Promise<Record<string, string>> {
    const client = getRedisClient();
    return await client.hGetAll(key);
  }

  /**
   * Delete hash field
   */
  static async deleteHashField(key: string, field: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.hDel(key, field);
    return result > 0;
  }

  /**
   * Check if hash field exists
   */
  static async hashFieldExists(key: string, field: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.hExists(key, field);
    return result === true;
  }
}

// Session-specific utilities
export class SessionUtil {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  /**
   * Store session data
   */
  static async setSession(sessionId: string, sessionData: object, expirationSeconds: number): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await RedisUtil.set(key, sessionData, expirationSeconds);
  }

  /**
   * Get session data
   */
  static async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await RedisUtil.getJSON<T>(key);
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await RedisUtil.delete(key);
  }

  /**
   * Extend session expiration
   */
  static async extendSession(sessionId: string, expirationSeconds: number): Promise<boolean> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await RedisUtil.expire(key, expirationSeconds);
  }

  /**
   * Add session to user's active sessions
   */
  static async addUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await RedisUtil.addToSet(key, sessionId);
  }

  /**
   * Remove session from user's active sessions
   */
  static async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await RedisUtil.removeFromSet(key, sessionId);
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<string[]> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    return await RedisUtil.getSetMembers(key);
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessions(userId);
    
    // Delete all session data
    const sessionKeys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
    if (sessionKeys.length > 0) {
      await RedisUtil.deleteMultiple(sessionKeys);
    }
    
    // Clear user sessions set
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await RedisUtil.delete(userSessionsKey);
  }

  /**
   * Check if session exists and is valid
   */
  static async isSessionValid(sessionId: string): Promise<boolean> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await RedisUtil.exists(key);
  }

  /**
   * Get session TTL
   */
  static async getSessionTTL(sessionId: string): Promise<number> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await RedisUtil.ttl(key);
  }
}

// Cache utilities for application data
export class CacheUtil {
  private static readonly CACHE_PREFIX = 'cache:';

  /**
   * Cache data with automatic JSON serialization
   */
  static async cache<T extends string | object>(key: string, data: T, expirationSeconds: number = 3600): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    await RedisUtil.set(cacheKey, data, expirationSeconds);
  }

  /**
   * Get cached data with automatic JSON parsing
   */
  static async getCached<T>(key: string): Promise<T | null> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    return await RedisUtil.getJSON<T>(cacheKey);
  }

  /**
   * Delete cached data
   */
  static async deleteCached(key: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`;
    return await RedisUtil.delete(cacheKey);
  }

  /**
   * Cache with function execution (cache-aside pattern)
   */
  static async cacheOrExecute<T extends string | object>(
    key: string,
    fetchFunction: () => Promise<T>,
    expirationSeconds: number = 3600
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.getCached<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fetchFunction();
    if (result !== null && result !== undefined) {
      await this.cache(key, result, expirationSeconds);
    }
    return result;
  }

  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(pattern: string): Promise<number> {
    const cachePattern = `${this.CACHE_PREFIX}${pattern}`;
    const keys = await RedisUtil.keys(cachePattern);
    if (keys.length === 0) return 0;
    return await RedisUtil.deleteMultiple(keys);
  }
}


