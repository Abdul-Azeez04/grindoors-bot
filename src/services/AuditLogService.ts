import { Guild, EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export class AuditLogService {
  static async log(guildId: string, actorId: string, action: string, targetId?: string, targetType?: string, metadata?: any): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: { guildId, actorId, action, targetId, targetType, metadata }
      });
    } catch (error) {
      logger.error(`Failed to save audit log: ${error}`);
    }
  }

  static async getAuditLogs(guildId: string, options?: { action?: string, actorId?: string, limit?: number, offset?: number }) {
    return prisma.auditLog.findMany({
      where: {
        guildId,
        ...(options?.action && { action: options.action }),
        ...(options?.actorId && { actorId: options.actorId })
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async sendModLog(guild: Guild, embed: EmbedBuilder): Promise<void> {
    const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({ embeds: [embed] });
    }
  }
}
