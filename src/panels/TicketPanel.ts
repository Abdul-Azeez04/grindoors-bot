import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export function createTicketPanel() {
  const embed = new EmbedBuilder()
    .setTitle('🎫 COMMUNITY SUPPORT')
    .setDescription('Need help? Create a ticket below.')
    .setColor(Colors.PRIMARY);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_create')
      .setLabel('CREATE TICKET')
      .setStyle(ButtonStyle.Primary)
  );

  return { embeds: [embed], components: [row] };
}
