import { Events, GuildMember } from 'discord.js';
import { logger } from '../utils/logger';
import { EventHandler } from '../types';

const event: EventHandler = {
  name: 'guildMemberRemove',
  once: false,
  execute: async (member: GuildMember) => {
    try {
      logger.info(`Member left: ${member.user.tag} (${member.id})`);
    } catch (error) {
      logger.error(`Error in guildMemberRemove: ${error}`);
    }
  }
};

export default event;
