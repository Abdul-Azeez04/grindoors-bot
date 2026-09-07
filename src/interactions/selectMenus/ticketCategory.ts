import { StringSelectMenuInteraction } from 'discord.js';
import { TicketService } from '../../services/TicketService';

export async function handleTicketCategorySelect(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === 'select_ticket_category') {
    const category = interaction.values[0];
    
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
      return;
    }

    try {
      const { channel } = await TicketService.createTicket(interaction.guild.id, interaction.user.id, category, interaction.guild);
      await interaction.reply({ content: `Ticket created! Check <#${channel.id}>`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Failed to create ticket. Please try again later.', ephemeral: true });
    }
  }
}
