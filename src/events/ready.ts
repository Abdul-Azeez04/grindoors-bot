import { Client, ActivityType } from 'discord.js';
import { EventHandler } from '../types';
import { logger } from '../utils/logger';
import { prisma } from '../database/client';

const event: EventHandler = {
  name: 'ready',
  once: true,
  execute: async (client: Client) => {
    logger.info(`Logged in as ${client.user?.tag}!`);
    logger.info(`Serving ${client.guilds.cache.size} guilds.`);
    
    // Sync guilds to database
    for (const guild of client.guilds.cache.values()) {
      await prisma.guild.upsert({
        where: { id: guild.id },
        create: { id: guild.id, name: guild.name },
        update: { name: guild.name }
      }).catch((e: any) => logger.error(`DB Sync fail for ${guild.id}: ${e.message}`));
    }

    client.user?.setActivity('over the community', { type: ActivityType.Watching });
  }
};

export default event;
