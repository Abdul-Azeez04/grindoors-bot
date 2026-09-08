import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customId = 'verify_access_code';

export const execute = async (interaction: ButtonInteraction) => {
  try {
    const status = await verificationService.getMemberStatus(interaction.guildId!, interaction.user.id);
    if (status?.verificationStatus !== 'WAITING_ROOM') {
      return interaction.reply({ content: 'You are not in the waiting room yet. Please pass the CAPTCHA first.', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('modal_access_code')
      .setTitle('Enter Access Code');

    const codeInput = new TextInputBuilder()
      .setCustomId('access_code_input')
      .setLabel('Access Code')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  } catch (error) {
    logger.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
};
