import { Guild, EmbedBuilder, ChannelType } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';
import { logger } from "../utils/logger";

export class GMService {
  async postDailyGM(guild: Guild, guildId: string): Promise<void> {
    try {
      const quote = await this.getRandomQuote(guildId);
      if (!quote) return;

      const channels = await guild.channels.fetch();
      const gmChannel = channels.find(c => c?.name.includes('gm') && c.type === ChannelType.GuildText);
      
      if (gmChannel && gmChannel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('☀️ Good Morning!')
          .setColor(Colors.PRIMARY)
          .setDescription(quote.text)
          .setFooter({ text: quote.author ? `- ${quote.author}` : 'Daily GM' })
          .setTimestamp();
          
        await gmChannel.send({ embeds: [embed] });
        logger.info(`Posted daily GM in guild ${guildId}`);
      }
    } catch (error) {
      logger.error(`Error posting daily GM: ${error}`);
      throw error;
    }
  }

  async addQuote(guildId: string, text: string, author: string | null, createdById: string) {
    try {
      return await prisma.quote.create({
        data: { guildId, text, author, createdById }
      });
    } catch (error) {
      logger.error(`Error adding quote: ${error}`);
      throw error;
    }
  }

  async getQuotes(guildId: string) {
    try {
      return await prisma.quote.findMany({ where: { guildId } });
    } catch (error) {
      logger.error(`Error getting quotes: ${error}`);
      throw error;
    }
  }

  async deleteQuote(quoteId: number) {
    try {
      await prisma.quote.delete({ where: { id: quoteId } });
    } catch (error) {
      logger.error(`Error deleting quote: ${error}`);
      throw error;
    }
  }

  async getRandomQuote(guildId: string) {
    try {
      const quotes = await this.getQuotes(guildId);
      if (quotes.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    } catch (error) {
      logger.error(`Error getting random quote: ${error}`);
      throw error;
    }
  }
}

export const gmService = new GMService();
