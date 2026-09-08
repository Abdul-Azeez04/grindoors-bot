import { EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';

export class MintService {
  async createMint(data: { guildId: string, projectName: string, chain: string, mintTime: Date, price: string, mintUrl?: string, contractUrl?: string, description?: string, alertRoleId?: string, createdById: string }) {
    try {
      return await prisma.mint.create({ data });
    } catch (error) {
      console.error(`Error creating mint: ${error}`);
      throw error;
    }
  }

  async updateMint(mintId: number, data: any) {
    try {
      return await prisma.mint.update({ where: { id: mintId }, data });
    } catch (error) {
      console.error(`Error updating mint: ${error}`);
      throw error;
    }
  }

  async deleteMint(mintId: number) {
    try {
      await prisma.mint.delete({ where: { id: mintId } });
    } catch (error) {
      console.error(`Error deleting mint: ${error}`);
      throw error;
    }
  }

  async getUpcomingMints(guildId: string) {
    try {
      return await prisma.mint.findMany({
        where: { guildId, mintTime: { gt: new Date() } },
        orderBy: { mintTime: 'asc' }
      });
    } catch (error) {
      console.error(`Error getting upcoming mints: ${error}`);
      throw error;
    }
  }

  async getTodayMints(guildId: string, timezone: string = 'UTC') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await prisma.mint.findMany({
        where: {
          guildId,
          mintTime: {
            gte: today,
            lt: tomorrow
          }
        },
        orderBy: { mintTime: 'asc' }
      });
    } catch (error) {
      console.error(`Error getting today's mints: ${error}`);
      throw error;
    }
  }

  async getTomorrowMints(guildId: string, timezone: string = 'UTC') {
    try {
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      return await prisma.mint.findMany({
        where: {
          guildId,
          mintTime: {
            gte: tomorrow,
            lt: dayAfter
          }
        },
        orderBy: { mintTime: 'asc' }
      });
    } catch (error) {
      console.error(`Error getting tomorrow's mints: ${error}`);
      throw error;
    }
  }

  createMintEmbed(mint: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🚀 ${mint.projectName}`)
      .setColor(Colors.SUCCESS)
      .addFields(
        { name: 'Chain', value: mint.chain, inline: true },
        { name: 'Price', value: mint.price, inline: true },
        { name: 'Time', value: `<t:${Math.floor(mint.mintTime.getTime() / 1000)}:F>`, inline: false }
      );
      
    if (mint.description) embed.setDescription(mint.description);
    if (mint.mintUrl) embed.setURL(mint.mintUrl);
    
    return embed;
  }
}

export const mintService = new MintService();
