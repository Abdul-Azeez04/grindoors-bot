import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { RaidProtectionService } from '../../services/RaidProtectionService';

export async function handleModerationButtons(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith('mod_')) return;
  
  if (!requireAdmin(interaction.member)) {
    return interaction.reply({ content: 'You do not have permission to use moderation tools.', ephemeral: true });
  }

  if (interaction.customId === 'mod_warn') {
    const modal = new ModalBuilder().setCustomId('modal_mod_warn').setTitle('Warn User');
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('target_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('severity').setLabel('Severity (LOW, MEDIUM, HIGH)').setStyle(TextInputStyle.Short).setRequired(true))
    );
    await interaction.showModal(modal);
  }

  if (interaction.customId === 'mod_timeout') {
    const modal = new ModalBuilder().setCustomId('modal_mod_timeout').setTitle('Timeout User');
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('target_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('duration').setLabel('Duration (seconds)').setStyle(TextInputStyle.Short).setRequired(true))
    );
    await interaction.showModal(modal);
  }

  if (interaction.customId === 'mod_kick') {
    const modal = new ModalBuilder().setCustomId('modal_mod_kick').setTitle('Kick User');
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('target_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true))
    );
    await interaction.showModal(modal);
  }

  if (interaction.customId === 'mod_ban') {
    const modal = new ModalBuilder().setCustomId('modal_mod_ban').setTitle('Ban User');
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('target_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true))
    );
    await interaction.showModal(modal);
  }

  if (interaction.customId === 'mod_raid_toggle') {
    if (!interaction.guild) return;
    // For toggle, normally we'd check DB state. We'll simulate toggle off if we don't know.
    await RaidProtectionService.deactivateRaidMode(interaction.guild);
    await interaction.reply({ content: 'Raid mode toggled.', ephemeral: true });
  }
}

export default {
  customIdRegex: /.*/,
  execute: async (interaction: any) => {
    return handleModerationButtons(interaction);
  }
};
