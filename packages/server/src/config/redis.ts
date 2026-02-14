import { createClient } from 'redis';
import { config } from './index';

export const redisClient = createClient({ url: config.redis.url });

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export async function connectRedis(): Promise<boolean> {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
    return true;
  } catch (err) {
    console.warn('Redis connection failed (non-critical for Phase 1):', err);
    return false;
  }
}
