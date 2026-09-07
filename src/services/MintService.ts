import { EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';

export class MintService {
  async createMint(data: { guildId: string, projectName: string, chain: string, mintTime: Date, price: string, mintUrl?: string, contractUrl?: string, description?: string, alertRoleId?: string, createdById: string }) {
    return prisma.mint.create({ data });
  }

  async updateMint(mintId: number, data: any) {
    return prisma.mint.update({ where: { id: mintId }, data });
  }

  async deleteMint(mintId: number) {
    await prisma.mint.delete({ where: { id: mintId } });
  }

  async getUpcomingMints(guildId: string) {
    return prisma.mint.findMany({
      where: { guildId, mintTime: { gt: new Date() } },
      orderBy: { mintTime: 'asc' }
    });
  }

  async getTodayMints(guildId: string, timezone: string = 'UTC') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.mint.findMany({
      where: {
        guildId,
        mintTime: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { mintTime: 'asc' }
    });
  }

  async getTomorrowMints(guildId: string, timezone: string = 'UTC') {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    return prisma.mint.findMany({
      where: {
        guildId,
        mintTime: {
          gte: tomorrow,
          lt: dayAfter
        }
      },
      orderBy: { mintTime: 'asc' }
    });
  }

  createMintEmbed(mint: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🚀 ${mint.projectName}`)
      .setColor(Colors.Success)
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
