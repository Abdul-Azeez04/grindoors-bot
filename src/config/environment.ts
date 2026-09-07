import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  BOT_OWNER_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DEFAULT_TIMEZONE: z.string().default('Africa/Lagos'),
  LOG_LEVEL: z.string().default('info'),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
