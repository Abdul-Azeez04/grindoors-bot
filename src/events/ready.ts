import { Client, ActivityType } from 'discord.js';
import { EventHandler } from '../types';
import { logger } from '../utils/logger';

const event: EventHandler = {
  name: 'ready',
  once: true,
  execute: async (client: Client) => {
    logger.info(`Logged in as ${client.user?.tag}!`);
    logger.info(`Serving ${client.guilds.cache.size} guilds.`);
    
    client.user?.setActivity('over the community', { type: ActivityType.Watching });
  }
};

export default event;
