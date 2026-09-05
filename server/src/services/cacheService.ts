import Redis from 'ioredis';
import { logger } from '../logger.js';

const REDIS_URL = process.env.REDIS_URL?.trim();

let redisClient: Redis | null = null;
if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 3000
    });
    redisClient.on('error', (err) => {
      logger.warn({ err: err?.message }, 'Redis connection issue, using memory cache');
    });
    redisClient.on('connect', () => {
      logger.info('Connected to Redis cache successfully');
    });
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'Failed to initialize Redis, falling back to memory cache');
    redisClient = null;
  }
}

// In-memory LRU fallback cache
interface CacheEntry {
  value: string;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();
const MAX_MEMORY_ITEMS = 500;

export async function getCached<T>(key: string): Promise<T | null> {
  // 1. Try Redis
  if (redisClient && redisClient.status === 'ready') {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch {
      // fallback to memory
    }
  }

  // 2. Memory Cache
  const entry = memoryCache.get(key);
  if (entry) {
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  return null;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number = 7 * 24 * 60 * 60): Promise<void> {
  const serialized = JSON.stringify(value);

  // 1. Try Redis
  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.setex(key, ttlSeconds, serialized);
      return;
    } catch {
      // fallback to memory
    }
  }

  // 2. Memory Cache
  if (memoryCache.size >= MAX_MEMORY_ITEMS) {
    // Evict oldest item
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}
