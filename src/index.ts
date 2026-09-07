import { env } from './config/environment';
import { logger } from './utils/logger';
import { Bot } from './bot';

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ err: reason, promise }, 'Unhandled Rejection at');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});

const bot = new Bot();
bot.start().catch((err) => {
  logger.fatal({ err }, 'Failed to start bot');
  process.exit(1);
});

export { bot };
