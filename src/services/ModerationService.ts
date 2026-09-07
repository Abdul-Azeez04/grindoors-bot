import { Guild, Message } from 'discord.js';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export class ModerationService {
  private static recentMessages = new Map<string, { content: string, timestamp: number }[]>();

  static async checkSpam(guildId: string, userId: string, message: Message): Promise<{ isSpam: boolean, reason?: string }> {
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
  }

  static async warnMember(guildId: string, targetId: string, moderatorId: string, reason: string, severity: string) {
    const warning = await prisma.warning.create({
      data: { guildId, targetId, moderatorId, reason, severity }
    });

    // Auto-escalate logic can be added here based on count
    return warning;
  }

  static async timeoutMember(guild: Guild, targetId: string, moderatorId: string, reason: string, durationSeconds: number) {
    const member = await guild.members.fetch(targetId).catch(() => null);
    if (member) {
      await member.timeout(durationSeconds * 1000, reason);
      await this.logAction(guild.id, 'TIMEOUT', targetId, moderatorId, reason, durationSeconds);
    }
  }

  static async kickMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    const member = await guild.members.fetch(targetId).catch(() => null);
    if (member) {
      await member.kick(reason);
      await this.logAction(guild.id, 'KICK', targetId, moderatorId, reason);
    }
  }

  static async banMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    await guild.members.ban(targetId, { reason });
    await this.logAction(guild.id, 'BAN', targetId, moderatorId, reason);
  }

  static async unbanMember(guild: Guild, targetId: string, moderatorId: string, reason: string) {
    await guild.members.unban(targetId, reason);
    await this.logAction(guild.id, 'UNBAN', targetId, moderatorId, reason);
  }

  static async logAction(guildId: string, action: string, targetId: string, moderatorId: string, reason?: string, duration?: number) {
    try {
      await prisma.modLog.create({
        data: { guildId, action, targetId, moderatorId, reason, duration }
      });
    } catch (error) {
      logger.error(`Error logging mod action: ${error}`);
    }
  }

  static async getWarnings(guildId: string, memberId: string) {
    return prisma.warning.findMany({
      where: { guildId, targetId: memberId }
    });
  }
}
