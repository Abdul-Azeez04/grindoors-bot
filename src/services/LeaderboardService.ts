import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export class LeaderboardService {
  static async getXPLeaderboard(guildId: string, limit = 10): Promise<{ discordId: string; username: string; xp: number; level: number }[]> {
    try {
      const members = await prisma.member.findMany({
        where: { guildId },
        orderBy: { xp: 'desc' },
        take: limit,
      });

      return members.map((m) => ({
        discordId: m.discordId,
        username: m.username || 'Unknown',
        xp: m.xp,
        level: m.level,
      }));
    } catch (error) {
      logger.error(`Error fetching XP leaderboard for guild ${guildId}:`, error);
      return [];
    }
  }

  static async getGameLeaderboard(guildId: string, limit = 10): Promise<{ discordId: string; username: string; totalGamesWon: number; totalGamesPlayed: number }[]> {
    try {
      const members = await prisma.member.findMany({
        where: { guildId, totalGamesWon: { gt: 0 } },
        orderBy: { totalGamesWon: 'desc' },
        take: limit,
      });

      return members.map((m) => ({
        discordId: m.discordId,
        username: m.username || 'Unknown',
        totalGamesWon: m.totalGamesWon,
        totalGamesPlayed: m.totalGamesPlayed,
      }));
    } catch (error) {
      logger.error(`Error fetching game leaderboard for guild ${guildId}:`, error);
      return [];
    }
  }

  static async getStreakLeaderboard(guildId: string, limit = 10): Promise<{ discordId: string; username: string; dailyStreak: number }[]> {
    try {
      const members = await prisma.member.findMany({
        where: { guildId, dailyStreak: { gt: 0 } },
        orderBy: { dailyStreak: 'desc' },
        take: limit,
      });

      return members.map((m) => ({
        discordId: m.discordId,
        username: m.username || 'Unknown',
        dailyStreak: m.dailyStreak,
      }));
    } catch (error) {
      logger.error(`Error fetching streak leaderboard for guild ${guildId}:`, error);
      return [];
    }
  }

  static async getWeeklyXPLeaderboard(guildId: string, limit = 10): Promise<{ discordId: string; username: string; xpEarned: number }[]> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const transactions = await prisma.xPTransaction.groupBy({
        by: ['memberId'],
        _sum: { amount: true },
        where: {
          createdAt: { gte: oneWeekAgo },
          guildId,
          amount: { gt: 0 }
        },
        orderBy: {
          _sum: { amount: 'desc' }
        },
        take: limit,
      });

      const memberIds = transactions.map((t) => t.memberId);
      const members = await prisma.member.findMany({
        where: { guildId, discordId: { in: memberIds } }
      });

      return transactions.map((t) => {
        const member = members.find((m) => m.discordId === t.memberId);
        return {
          discordId: member?.discordId || 'Unknown',
          username: member?.username || 'Unknown',
          xpEarned: t._sum.amount || 0,
        };
      });
    } catch (error) {
      logger.error(`Error fetching weekly XP leaderboard for guild ${guildId}:`, error);
      return [];
    }
  }

  static formatLeaderboard(entries: any[], valueField: string, valueLabel: string): string {
    if (entries.length === 0) return 'No data available yet.';

    const medals = ['🥇', '🥈', '🥉'];
    return entries.map((entry, index) => {
      const rank = index < 3 ? medals[index] : `**#${index + 1}**`;
      return `${rank} <@${entry.discordId}> - ${entry[valueField]} ${valueLabel}`;
    }).join('\n');
  }
}
