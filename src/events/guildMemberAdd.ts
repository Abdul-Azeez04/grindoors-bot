import { Events, GuildMember } from 'discord.js';
import { verificationService } from '../services/VerificationService';
import { logger } from '../utils/logger';
import { EventHandler } from '../types';

const event: EventHandler = {
  name: 'guildMemberAdd',
  once: false,
  execute: async (member: GuildMember) => {
    try {
      await verificationService.startVerification(member.guild.id, member.id, member.user.username);
      const unverifiedRole = member.guild.roles.cache.find(r => r.name === 'Unverified');
      if (unverifiedRole) {
        await member.roles.add(unverifiedRole);
      }
      logger.info(`Member joined: ${member.user.tag} (${member.id})`);
    } catch (error) {
      logger.error(`Error in guildMemberAdd: ${error}`);
    }
  }
};

export default event;
