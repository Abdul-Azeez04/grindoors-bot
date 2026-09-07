import { ModalSubmitInteraction } from 'discord.js';
import { gmService } from '../../services/GMService';
import logger from '../../utils/logger';

export async function handleQuoteModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId === 'modal_add_quote') {
    const text = interaction.fields.getTextInputValue('quote_text');
    let author: string | null = null;
    
    try {
      author = interaction.fields.getTextInputValue('quote_author') || null;
    } catch {
      author = null;
    }

    try {
      await gmService.addQuote(interaction.guildId!, text, author, interaction.user.id);
      await interaction.reply({ content: 'Quote added successfully!', ephemeral: true });
    } catch (error) {
      logger.error('Failed to add quote', error);
      await interaction.reply({ content: 'An error occurred while adding the quote.', ephemeral: true });
    }
  }
}
