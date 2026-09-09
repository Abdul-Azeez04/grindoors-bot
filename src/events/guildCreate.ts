import { Guild, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { logger } from "../utils/logger";
import { Colors } from '../config/constants';
import { EventHandler } from '../types';
import { prisma } from '../database/client';

const event: EventHandler = {
  name: 'guildCreate',
  once: false,
  execute: async (guild: Guild) => {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    
    // Register guild in the database to prevent Foreign Key failures
    await prisma.guild.upsert({
      where: { id: guild.id },
      create: { id: guild.id, name: guild.name },
      update: { name: guild.name }
    }).catch((err: any) => logger.error(`Failed to register guild in DB: ${err.message}`));

    let targetChannel = guild.systemChannel;
    if (!targetChannel || !targetChannel.isTextBased()) {
      targetChannel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me!)?.has('SendMessages')) as any;
    }

    if (targetChannel && targetChannel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle(`👋 Welcome to ${guild.name}!`)
        .setColor(Colors.PRIMARY)
        .setDescription(`Thank you for adding me to **${guild.name}**! Click below to configure roles, channels, and modules for your community.`);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('setup_quick').setLabel('Quick Setup').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('setup_advanced').setLabel('Advanced Setup').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('setup_audit').setLabel('Audit Existing').setStyle(ButtonStyle.Secondary)
      );

      try {
        await targetChannel.send({ embeds: [embed], components: [row] });
      } catch (e) {
        logger.error(`Could not send welcome message in guild ${guild.id}:`, e);
      }
    }
  }
};

export default event;
