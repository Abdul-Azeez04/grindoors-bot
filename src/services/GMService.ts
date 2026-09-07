import { Guild, EmbedBuilder, ChannelType } from 'discord.js';
import prisma from '../database/client';
import { Colors } from '../config/constants';
import logger from '../utils/logger';

export class GMService {
  async postDailyGM(guild: Guild, guildId: string): Promise<void> {
    const quote = await this.getRandomQuote(guildId);
    if (!quote) return;

    const channels = await guild.channels.fetch();
    const gmChannel = channels.find(c => c?.name.includes('gm') && c.type === ChannelType.GuildText);
    
    if (gmChannel && gmChannel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('☀️ Good Morning!')
        .setColor(Colors.Primary)
        .setDescription(quote.text)
        .setFooter({ text: quote.author ? `- ${quote.author}` : 'Daily GM' })
        .setTimestamp();
        
      await gmChannel.send({ embeds: [embed] });
      logger.info(`Posted daily GM in guild ${guildId}`);
    }
  }

  async addQuote(guildId: string, text: string, author: string | null, createdById: string) {
    return prisma.quote.create({
      data: { guildId, text, author, createdById }
    });
  }

  async getQuotes(guildId: string) {
    return prisma.quote.findMany({ where: { guildId } });
  }

  async deleteQuote(quoteId: number) {
    await prisma.quote.delete({ where: { id: quoteId } });
  }

  async getRandomQuote(guildId: string) {
    const quotes = await this.getQuotes(guildId);
    if (quotes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
}

export const gmService = new GMService();
