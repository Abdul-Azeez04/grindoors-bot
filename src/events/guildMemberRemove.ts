import { Events, GuildMember } from 'discord.js';
import { logger } from '../utils/logger';

export const name = Events.GuildMemberRemove;
export const execute = async (member: GuildMember) => {
  try {
    logger.info(`Member left: ${member.user.tag} (${member.id})`);
    // Audit log placeholder
  } catch (error) {
    logger.error(`Error in guildMemberRemove: ${error}`);
  }
};
