import { Worker } from 'bullmq';
import { redisConnection } from './queue';
import logger from '../utils/logger';
import dailyGMHandler from './jobs/dailyGM';
import mintAlertsHandler from './jobs/mintAlerts';
import dailyRoleRotationHandler from './jobs/dailyRoleRotation';

export const worker = new Worker('grindoors-scheduler', async (job) => {
  try {
    switch (job.name) {
      case 'daily-gm':
        await dailyGMHandler(job.data);
        break;
      case 'mint-alert':
        await mintAlertsHandler(job.data);
        break;
      case 'daily-role-rotation':
        await dailyRoleRotationHandler(job.data);
        break;
      case 'daily-challenge':
        // to be implemented
        break;
      default:
        logger.warn(`Unknown job name: ${job.name}`);
    }
  } catch (error) {
    logger.error(`Error processing job ${job.name}:`, error);
    throw error;
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed with error ${err.message}`);
});
