import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { TicketService } from '../../services/TicketService';
import { requireModerator } from '../../middleware/permissionGuard';
import { Colors } from '../../config/constants';

export async function handleTicketButtons(interaction: ButtonInteraction) {
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
          { label: 'Payment', value: 'PAYMENT' },
          { label: 'Other', value: 'OTHER' }
        ])
    );
    await interaction.reply({ content: 'Please select a ticket category:', components: [row], ephemeral: true });
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
    // Determine ticket ID from DB based on channel ID in real implementation
    // Mock ID here for typing
    const ticketId = 1; 
    await TicketService.closeTicket(ticketId, interaction.user.id);
    await interaction.reply('Ticket closed. Archiving channel...');
    // await interaction.channel?.delete();
    return;
  }

  if (interaction.customId === 'ticket_close_cancel') {
    await interaction.message.delete().catch(() => {});
    return;
  }

  if (interaction.customId === 'ticket_claim') {
    if (!requireModerator(interaction.member)) {
      return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
    }
    // const ticketId = 1;
    // await TicketService.claimTicket(ticketId, interaction.user.id);
    await interaction.reply(`Ticket claimed by ${interaction.user}.`);
    return;
  }

  if (interaction.customId === 'ticket_escalate') {
    if (!requireModerator(interaction.member)) {
      return interaction.reply({ content: 'You do not have permission to escalate tickets.', ephemeral: true });
    }
    // const ticketId = 1;
    // await TicketService.escalateTicket(ticketId);
    await interaction.reply(`Ticket escalated by ${interaction.user}.`);
    return;
  }
}

export default {
  customIdRegex: /.*/,
  execute: async (interaction: any) => {
    return handleTicketButtons(interaction);
  }
};
