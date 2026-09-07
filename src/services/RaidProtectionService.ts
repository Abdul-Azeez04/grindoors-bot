import { Guild } from 'discord.js';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export class RaidProtectionService {
  private static recentJoins = new Map<string, { timestamps: number[] }>();

  static registerJoin(guildId: string): void {
    const now = Date.now();
    const data = this.recentJoins.get(guildId) || { timestamps: [] };
    data.timestamps.push(now);
    this.recentJoins.set(guildId, data);
  }

  static isRaidDetected(guildId: string, threshold: number, windowMs: number): boolean {
    const data = this.recentJoins.get(guildId);
    if (!data) return false;

    const now = Date.now();
    data.timestamps = data.timestamps.filter(t => now - t < windowMs);
    this.recentJoins.set(guildId, data);

    return data.timestamps.length >= threshold;
  }

  static async activateRaidMode(guild: Guild): Promise<void> {
    try {
      await prisma.guild.update({
        where: { id: guild.id },
        data: { raidMode: true }
      });
      logger.info(`Raid mode activated for guild ${guild.id}`);
    } catch (error) {
      logger.error(`Failed to activate raid mode: ${error}`);
    }
  }

  static async deactivateRaidMode(guild: Guild): Promise<void> {
    try {
      await prisma.guild.update({
        where: { id: guild.id },
        data: { raidMode: false }
      });
      logger.info(`Raid mode deactivated for guild ${guild.id}`);
    } catch (error) {
      logger.error(`Failed to deactivate raid mode: ${error}`);
    }
  }

  static cleanupOldJoins(): void {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    for (const [guildId, data] of this.recentJoins.entries()) {
      data.timestamps = data.timestamps.filter(t => now - t < tenMinutes);
      if (data.timestamps.length === 0) {
        this.recentJoins.delete(guildId);
      } else {
        this.recentJoins.set(guildId, data);
      }
    }
  }
}

setInterval(() => RaidProtectionService.cleanupOldJoins(), 5 * 60 * 1000);
