import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { accessCodeService } from '../../services/AccessCodeService';
import { logger } from '../../utils/logger';

export const customIdRegex = /^admin_ac_(.*)$/;

export const execute = async (interaction: ButtonInteraction) => {
  if (!requireAdmin(interaction.member)) {
    return interaction.reply({ content: 'Unauthorized.', ephemeral: true });
  }

  const match = interaction.customId.match(customIdRegex);
  if (!match) return;
  const action = match[1];

  try {
    if (action === 'generate') {
      const modal = new ModalBuilder()
        .setCustomId('modal_generate_code')
        .setTitle('Generate Access Code');

      const nameInput = new TextInputBuilder()
        .setCustomId('code_name')
        .setLabel('Name (e.g. Twitter Campaign)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const maxUsesInput = new TextInputBuilder()
        .setCustomId('code_max_uses')
        .setLabel('Max Uses (empty for unlimited)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
        
      const expiresInHoursInput = new TextInputBuilder()
        .setCustomId('code_expires_in')
        .setLabel('Expires In Hours (empty for never)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(maxUsesInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(expiresInHoursInput)
      );

      await interaction.showModal(modal);
    } else if (action === 'view') {
      await interaction.deferReply({ ephemeral: true });
      const codes = await accessCodeService.getActiveCodes(interaction.guildId!);
      const list = codes.map(c => `${c.name}: \`${c.code}\` (Uses: ${c.currentUses}/${c.maxUses || '∞'})`).join('\n') || 'No active codes.';
      await interaction.editReply(list);
    } else {
      await interaction.reply({ content: 'Action not implemented yet.', ephemeral: true });
    }
  } catch (error) {
    logger.error(error);
    if (!interaction.replied) await interaction.reply({ content: 'Error.', ephemeral: true });
  }
};
