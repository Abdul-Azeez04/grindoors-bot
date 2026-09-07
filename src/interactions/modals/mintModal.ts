import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { mintService } from '../../services/MintService';
import { Colors } from '../../config/constants';
import logger from '../../utils/logger';

export async function handleMintModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId === 'modal_add_mint') {
    const projectName = interaction.fields.getTextInputValue('projectName');
    const chain = interaction.fields.getTextInputValue('chain');
    const mintTimeStr = interaction.fields.getTextInputValue('mintTime');
    const price = interaction.fields.getTextInputValue('price');
    
    let description;
    try {
      description = interaction.fields.getTextInputValue('description');
    } catch {
      description = '';
    }

    const mintTime = new Date(mintTimeStr);
    
    if (isNaN(mintTime.getTime())) {
      return interaction.reply({ content: 'Invalid time format. Please use ISO format (e.g. 2024-12-01T15:00:00Z)', ephemeral: true });
    }

    try {
      const mint = await mintService.createMint({
        guildId: interaction.guildId!,
        projectName,
        chain,
        mintTime,
        price,
        description,
        createdById: interaction.user.id
      });

      const embed = mintService.createMintEmbed(mint);
      await interaction.reply({ content: 'Mint successfully scheduled!', embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error('Failed to create mint', error);
      await interaction.reply({ content: 'An error occurred while creating the mint.', ephemeral: true });
    }
  }
}
