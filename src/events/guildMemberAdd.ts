import { Events, GuildMember } from 'discord.js';
import { verificationService } from '../services/VerificationService';
import { logger } from '../utils/logger';

export const name = Events.GuildMemberAdd;
export const execute = async (member: GuildMember) => {
  try {
    await verificationService.startVerification(member.guild.id, member.id);
    const unverifiedRole = member.guild.roles.cache.find(r => r.name === 'Unverified');
    if (unverifiedRole) {
      await member.roles.add(unverifiedRole);
    }
    logger.info(`Member joined: ${member.user.tag} (${member.id})`);
    // Audit log placeholder (if a specific service exists)
  } catch (error) {
    logger.error(`Error in guildMemberAdd: ${error}`);
  }
};
