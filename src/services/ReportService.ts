import { Guild, EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";
import { Colors } from '../config/constants';

export class ReportService {
  static async createReport(guildId: string, reporterId: string, category: string, description: string, targetId?: string) {
    try {
      const report = await prisma.report.create({
        data: {
          guildId,
          reporterId,
          category,
          description,
          targetId,
          status: 'PENDING'
        }
      });
      return report;
    } catch (error) {
      logger.error(`Error creating report: ${error}`);
      throw error;
    }
  }

  static async getReports(guildId: string, status?: string) {
    try {
      const whereClause: any = { guildId };
      if (status) whereClause.status = status;
      return await prisma.report.findMany({ where: whereClause });
    } catch (error) {
      logger.error(`Error getting reports: ${error}`);
      throw error;
    }
  }

  static async updateReportStatus(reportId: number, status: string, handledById: string) {
    try {
      await prisma.report.update({
        where: { id: reportId },
        data: { status, handledById }
      });
    } catch (error) {
      logger.error(`Error updating report status: ${error}`);
      throw error;
    }
  }

  static async sendReportToStaff(guild: Guild, report: any) {
    try {
      const channel = guild.channels.cache.find(c => c.name === 'reports' || c.name === 'mod-logs');
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('🚨 New Report')
          .addFields(
            { name: 'Report ID', value: report.id.toString(), inline: true },
            { name: 'Reporter', value: `<@${report.reporterId}>`, inline: true },
            { name: 'Category', value: report.category, inline: true },
            { name: 'Description', value: report.description }
          )
          .setColor(Colors.WARNING);

        if (report.targetId) {
          embed.addFields({ name: 'Target User', value: `<@${report.targetId}>`, inline: true });
        }

        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error(`Error sending report to staff: ${error}`);
      throw error;
    }
  }
}
