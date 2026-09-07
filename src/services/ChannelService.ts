import { Guild, ChannelType, GuildChannel, CategoryChannel, OverwriteResolvable } from 'discord.js';
import { logger } from "../utils/logger";

export class ChannelService {
  async createChannel(guild: Guild, name: string, type: ChannelType, options?: { category?: string, topic?: string, permissions?: OverwriteResolvable[] }): Promise<GuildChannel> {
    try {
      const channel = await guild.channels.create({
        name,
        type,
        parent: options?.category,
        topic: options?.topic,
        permissionOverwrites: options?.permissions,
      });
      logger.info(`Created channel ${name} in guild ${guild.id}`);
      return channel;
    } catch (error) {
      logger.error(`Error creating channel ${name}:`, error);
      throw error;
    }
  }

  async deleteChannel(channel: GuildChannel): Promise<void> {
    try {
      await channel.delete();
      logger.info(`Deleted channel ${channel.name} in guild ${channel.guild.id}`);
    } catch (error) {
      logger.error(`Error deleting channel ${channel.name}:`, error);
      throw error;
    }
  }

  async renameChannel(channel: GuildChannel, newName: string): Promise<void> {
    try {
      await channel.setName(newName);
      logger.info(`Renamed channel to ${newName} in guild ${channel.guild.id}`);
    } catch (error) {
      logger.error(`Error renaming channel ${channel.name}:`, error);
      throw error;
    }
  }

  async moveChannel(channel: GuildChannel, categoryId: string): Promise<void> {
    try {
      await channel.setParent(categoryId);
      logger.info(`Moved channel ${channel.name} to category ${categoryId} in guild ${channel.guild.id}`);
    } catch (error) {
      logger.error(`Error moving channel ${channel.name}:`, error);
      throw error;
    }
  }

  async createCategory(guild: Guild, name: string): Promise<CategoryChannel> {
    try {
      const category = await guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
      });
      logger.info(`Created category ${name} in guild ${guild.id}`);
      return category;
    } catch (error) {
      logger.error(`Error creating category ${name}:`, error);
      throw error;
    }
  }

  async deleteCategory(category: CategoryChannel): Promise<void> {
    try {
      await category.delete();
      logger.info(`Deleted category ${category.name} in guild ${category.guild.id}`);
    } catch (error) {
      logger.error(`Error deleting category ${category.name}:`, error);
      throw error;
    }
  }

  async renameCategory(category: CategoryChannel, newName: string): Promise<void> {
    try {
      await category.setName(newName);
      logger.info(`Renamed category to ${newName} in guild ${category.guild.id}`);
    } catch (error) {
      logger.error(`Error renaming category ${category.name}:`, error);
      throw error;
    }
  }

  async getChannelStats(guild: Guild): Promise<{ total: number, text: number, voice: number, categories: number, empty: number }> {
    const channels = await guild.channels.fetch();
    const stats = { total: 0, text: 0, voice: 0, categories: 0, empty: 0 };
    
    for (const [id, channel] of channels) {
      if (!channel) continue;
      stats.total++;
      if (channel.type === ChannelType.GuildText) stats.text++;
      if (channel.type === ChannelType.GuildVoice) stats.voice++;
      if (channel.type === ChannelType.GuildCategory) stats.categories++;
      
      if (channel.type === ChannelType.GuildText && 'messages' in channel) {
        try {
          const messages = await channel.messages.fetch({ limit: 1 }).catch(() => null);
          if (!messages || messages.size === 0) stats.empty++;
        } catch {
          // ignore
        }
      }
    }
    
    return stats;
  }
}

export const channelService = new ChannelService();
