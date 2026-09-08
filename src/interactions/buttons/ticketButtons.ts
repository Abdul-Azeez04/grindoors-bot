import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } from 'discord.js';
import { Colors } from '../../config/constants';
import { logger } from '../../utils/logger';

export async function handleTicketButtons(interaction: ButtonInteraction) {
  try {
    if (interaction.customId === 'ticket_create') {
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_ticket_category')
          .setPlaceholder('Select a category...')
          .addOptions([
            { label: 'General', value: 'GENERAL' },
            { label: 'Verification', value: 'VERIFICATION' },
            { label: 'Report', value: 'REPORT' },
            { label: 'Partnership', value: 'PARTNERSHIP' },
            { label: 'Technical', value: 'TECHNICAL' },
            { label: 'Other', value: 'OTHER' }
          ])
      );
      await interaction.reply({ content: '📩 Please select a ticket category:', components: [row], ephemeral: true });
      return;
    }

    if (interaction.customId === 'ticket_close') {
      const embed = new EmbedBuilder()
        .setTitle('Close Ticket')
        .setDescription('Are you sure you want to close this ticket?')
        .setColor(Colors.WARNING);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('YES').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_close_cancel').setLabel('CANCEL').setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (interaction.customId === 'ticket_close_confirm') {
      await interaction.reply({ content: '🔒 Ticket closed. This channel will be deleted in 5 seconds...' });
      setTimeout(async () => {
        try { await interaction.channel?.delete(); } catch(e) { /* channel already gone */ }
      }, 5000);
      return;
    }

    if (interaction.customId === 'ticket_close_cancel') {
      await interaction.message.delete().catch(() => {});
      return;
    }

    if (interaction.customId === 'ticket_claim') {
      await interaction.reply({ content: `✅ Ticket claimed by ${interaction.user}.` });
      return;
    }

    if (interaction.customId === 'ticket_escalate') {
      await interaction.reply({ content: `⚠️ Ticket escalated by ${interaction.user}.` });
      return;
    }
  } catch (error) {
    logger.error('Error handling ticket button:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
    }
  }
}

export default {
  customIdRegex: /^ticket_/,
  execute: async (interaction: any) => {
    return handleTicketButtons(interaction);
  }
};
