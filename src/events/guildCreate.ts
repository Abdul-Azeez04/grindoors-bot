import { Guild, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { logger } from "../utils/logger";
import { Colors } from '../config/constants';

export async function handleGuildCreate(guild: Guild) {
  logger.info(`Joined new guild: ${guild.name} (${guild.id})`);

  let targetChannel = guild.systemChannel;
  if (!targetChannel || !targetChannel.isTextBased()) {
    targetChannel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me!)?.has('SendMessages')) as any;
  }

  if (targetChannel && targetChannel.isTextBased()) {
    const embed = new EmbedBuilder()
      .setTitle('👋 Welcome to GRINDOORS Bot')
      .setColor(Colors.Primary)
      .setDescription('Thank you for adding me to your server! Click below to start the setup process.');

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
