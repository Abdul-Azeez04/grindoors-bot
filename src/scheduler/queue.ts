import { Queue } from 'bullmq';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const schedulerQueue = new Queue('grindoors-scheduler', {
  connection: redisConnection,
});
