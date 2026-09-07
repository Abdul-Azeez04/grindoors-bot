import { prisma } from "../database/client";
import { Colors } from '../config/constants';
import { logger } from "../utils/logger";

export const DEFAULT_LEVELS = [
  { level: 1, xp: 0, name: 'Fresh Wallet' },
  { level: 5, xp: 500, name: 'Grinder' },
  { level: 10, xp: 2000, name: 'Degen' },
  { level: 20, xp: 5000, name: 'Sniper' },
  { level: 30, xp: 10000, name: 'Alpha Hunter' },
  { level: 50, xp: 25000, name: 'Whale' },
  { level: 75, xp: 50000, name: 'OG' },
  { level: 100, xp: 100000, name: 'Legend' }
];

export class XPService {
  private static cooldowns = new Map<string, number>();

  static async awardXP(
    guildId: string,
    memberId: string,
    amount: number,
    source: 'GAME' | 'DAILY' | 'STREAK' | 'CHALLENGE' | 'EVENT' | 'ADMIN' | 'OTHER',
    description?: string
  ): Promise<{ newXP: number; leveledUp: boolean; newLevel?: number }> {
    try {
      const member = await prisma.member.upsert({
        where: { discordId_guildId: { discordId: memberId, guildId } },
        update: { xp: { increment: amount } },
        create: { discordId: memberId, guildId, xp: amount, level: 1 }
      });

      await prisma.xPTransaction.create({
        data: {
          memberId: member.id,
          amount,
          source,
          description: description || null
        }
      });

      const oldLevel = member.level;
      const { level: newLevel } = this.getLevelForXP(member.xp);

      let leveledUp = false;
      if (newLevel > oldLevel) {
        leveledUp = true;
        await prisma.member.update({
          where: { id: member.id },
          data: { level: newLevel }
        });
      }

      return { newXP: member.xp, leveledUp, newLevel: leveledUp ? newLevel : undefined };
    } catch (error) {
      logger.error(`Error awarding XP to ${memberId}:`, error);
      throw error;
    }
  }

  static async removeXP(guildId: string, memberId: string, amount: number, reason: string): Promise<void> {
    try {
      const member = await prisma.member.findUnique({
        where: { discordId_guildId: { discordId: memberId, guildId } }
      });
      if (!member) return;

      const newXP = Math.max(0, member.xp - amount);
      const { level: newLevel } = this.getLevelForXP(newXP);

      await prisma.member.update({
        where: { id: member.id },
        data: { xp: newXP, level: newLevel }
      });

      await prisma.xPTransaction.create({
        data: {
          memberId: member.id,
          amount: -amount,
          source: 'ADMIN',
          description: reason
        }
      });
    } catch (error) {
      logger.error(`Error removing XP from ${memberId}:`, error);
      throw error;
    }
  }

  static async getXP(guildId: string, memberId: string): Promise<{ xp: number; level: number; rank: number }> {
    try {
      const member = await prisma.member.findUnique({
        where: { discordId_guildId: { discordId: memberId, guildId } }
      });
      if (!member) return { xp: 0, level: 1, rank: 0 };

      const rank = await prisma.member.count({
        where: {
          guildId,
          xp: { gt: member.xp }
        }
      });

      return { xp: member.xp, level: member.level, rank: rank + 1 };
    } catch (error) {
      logger.error(`Error fetching XP for ${memberId}:`, error);
      throw error;
    }
  }

  static isOnCooldown(guildId: string, memberId: string, cooldownMs: number): boolean {
    const key = `${guildId}-${memberId}`;
    const lastAward = this.cooldowns.get(key) || 0;
    const now = Date.now();
    if (now - lastAward < cooldownMs) return true;
    this.cooldowns.set(key, now);
    return false;
  }

  static getLevelForXP(xp: number): { level: number; name: string } {
    let currentLevel = DEFAULT_LEVELS[0];
    for (const level of DEFAULT_LEVELS) {
      if (xp >= level.xp) {
        currentLevel = level;
      } else {
        break;
      }
    }
    return { level: currentLevel.level, name: currentLevel.name };
  }

  static getXPForLevel(level: number): number {
    const levelData = DEFAULT_LEVELS.find((l) => l.level === level);
    if (levelData) return levelData.xp;
    // Fallback formula if not in defaults
    return Math.floor(100 * Math.pow(level, 1.5));
  }
}
