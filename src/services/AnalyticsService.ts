import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export type Analytics = {
  totalMembers: number;
  verifiedMembers: number;
  waitingMembers: number;
  bannedMembers: number;
  totalXPGenerated: number;
  gamesPlayed: number;
  ticketsOpened: number;
  ticketsClosed: number;
  reportsPending: number;
  warningsIssued: number;
  moderationActions: number;
  mintsScheduled: number;
};

export class AnalyticsService {
  static async getOverview(guildId: string): Promise<Analytics> {
    try {
      const totalMembers = await prisma.member.count({ where: { guildId } });
      const verifiedMembers = await prisma.member.count({ where: { guildId, isVerified: true } });
      const waitingMembers = totalMembers - verifiedMembers;
      
      const xpAgg = await prisma.member.aggregate({
        where: { guildId },
        _sum: { xp: true, totalGamesPlayed: true, warningsCount: true }
      });
      const totalXPGenerated = xpAgg._sum.xp || 0;
      const gamesPlayed = xpAgg._sum.totalGamesPlayed || 0;
      const warningsIssued = xpAgg._sum.warningsCount || 0;

      const ticketsOpened = await prisma.ticket.count({ where: { guildId, status: 'OPEN' } });
      const ticketsClosed = await prisma.ticket.count({ where: { guildId, status: 'CLOSED' } });
      
      const reportsPending = await prisma.report.count({ where: { guildId, status: 'PENDING' } });
      
      const moderationActions = await prisma.auditLog.count({
        where: { guildId, action: { in: ['BAN', 'KICK', 'WARN', 'MUTE'] } }
      });

      const mintsScheduled = await prisma.mintEvent.count({
        where: { guildId, status: 'SCHEDULED' }
      });

      return {
        totalMembers,
        verifiedMembers,
        waitingMembers,
        bannedMembers: 0, // Placeholder
        totalXPGenerated,
        gamesPlayed,
        ticketsOpened,
        ticketsClosed,
        reportsPending,
        warningsIssued,
        moderationActions,
        mintsScheduled
      };
    } catch (error) {
      logger.error(`Error fetching analytics overview for guild ${guildId}:`, error);
      throw error;
    }
  }

  static async getDailyStats(guildId: string, days = 7): Promise<{ date: string; joins: number; verifications: number; games: number; xp: number }[]> {
    try {
      // Stub implementation since complex groupBy requires raw queries or specific setup
      // A full implementation would use raw queries grouping by date
      const stats = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        stats.push({
          date: d.toISOString().split('T')[0],
          joins: 0,
          verifications: 0,
          games: 0,
          xp: 0
        });
      }
      return stats;
    } catch (error) {
      logger.error(`Error fetching daily stats for guild ${guildId}:`, error);
      throw error;
    }
  }
}
