import { Guild, Message } from 'discord.js';
import { WarningSeverity, ModActionType } from '@prisma/client';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export class ModerationService {
  private static recentMessages = new Map<string, { content: string, timestamp: number }[]>();

  static async checkSpam(guildId: string, userId: string, message: Message): Promise<{ isSpam: boolean, reason?: string }> {
    try {
      const key = `${guildId}-${userId}`;
      const userMessages = this.recentMessages.get(key) || [];
      const now = Date.now();
      
      // Clean old messages (older than 10s)
      const recent = userMessages.filter(m => now - m.timestamp < 10000);
      recent.push({ content: message.content, timestamp: now });
      this.recentMessages.set(key, recent);

      if (recent.length >= 5) {
        return { isSpam: true, reason: 'Message flooding (5+ messages in 10s)' };
      }

      const identical = recent.filter(m => m.content === message.content);
      if (identical.length >= 3) {
        return { isSpam: true, reason: 'Repeated messages' };
      }

      if (message.mentions.users.size >= 5) {
        return { isSpam: true, reason: 'Mass mentions' };
      }

      return { isSpam: false };
    } catch (error) {
      logger.error(`Error in checkSpam: ${error}`);
      throw error;
    }
  }

  static async warnMember(guildId: string, memberId: string, moderatorId: string, reason: string, severity: WarningSeverity | string = WarningSeverity.MEDIUM) {
    try {
      const warning = await prisma.warning.create({
        data: { guildId, memberId, moderatorId, reason, severity: severity as WarningSeverity }
      });

      await prisma.member.update({
        where: { discordId_guildId: { discordId: memberId, guildId } },
        data: { warningCount: { increment: 1 } }
      });

      // Auto-escalate logic can be added here based on count
      return warning;
    } catch (error) {
      logger.error(`Error in warnMember: ${error}`);
      throw error;
    }
  }

  static async timeoutMember(guild: Guild, targetId: string, moderatorId: string, reason: string, durationSeconds: number) {
    try {
      const member = await guild.members.fetch(targetId).catch(() => null);
      if (member) {
        await member.timeout(durationSeconds * 1000, reason);
        await this.logAction(guild.id, 'TIMEOUT', targetId, moderatorId, reason, durationSeconds);
      }
    } catch (error) {
      logger.error(`Error in timeoutMember: ${error}`);
      throw error;
    }
  }

  static async kickMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    try {
      const member = await guild.members.fetch(targetId).catch(() => null);
      if (member) {
        await member.kick(reason);
        await this.logAction(guild.id, 'KICK', targetId, moderatorId, reason);
      }
    } catch (error) {
      logger.error(`Error in kickMember: ${error}`);
      throw error;
    }
  }

  static async banMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    try {
      await guild.members.ban(targetId, { reason });
      await this.logAction(guild.id, 'BAN', targetId, moderatorId, reason);
    } catch (error) {
      logger.error(`Error in banMember: ${error}`);
      throw error;
    }
  }

  static async unbanMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    try {
      await guild.members.unban(targetId, reason);
      await this.logAction(guild.id, 'UNBAN', targetId, moderatorId, reason);
    } catch (error) {
      logger.error(`Error in unbanMember: ${error}`);
      throw error;
    }
  }

  static async logAction(guildId: string, action: ModActionType | string, targetId: string, moderatorId: string, reason?: string, duration?: number) {
    try {
      await prisma.moderationAction.create({
        data: { guildId, action: action as ModActionType, targetId, moderatorId, reason, duration }
      });
    } catch (error) {
      logger.error(`Error logging mod action: ${error}`);
    }
  }

  static async getWarnings(guildId: string, memberId: string) {
    try {
      return await prisma.warning.findMany({
        where: { guildId, memberId }
      });
    } catch (error) {
      logger.error(`Error in getWarnings: ${error}`);
      throw error;
    }
  }
}
