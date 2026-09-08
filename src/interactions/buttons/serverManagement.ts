import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { channelService } from '../../services/ChannelService';
import { serverAuditService } from '../../services/ServerAuditService';
import { Colors } from '../../config/constants';

export async function handleServerManagementButtons(interaction: ButtonInteraction) {
  if (!requireAdmin(interaction)) {
    return interaction.reply({ content: 'Missing permissions.', ephemeral: true });
  }

  const { customId } = interaction;

  if (customId === 'admin_server_struct') {
    if (!interaction.guild) return;
    const stats = await channelService.getChannelStats(interaction.guild);
    
    const embed = new EmbedBuilder()
      .setTitle('Server Structure')
      .setColor(Colors.PRIMARY)
      .setDescription(`Total: ${stats.total}\nText: ${stats.text}\nVoice: ${stats.voice}\nCategories: ${stats.categories}\nEmpty: ${stats.empty}`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('admin_create_channel').setLabel('Create Channel').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('admin_create_category').setLabel('Create Category').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('admin_cleanup').setLabel('Audit Server').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  if (customId === 'admin_cleanup') {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });
    
    const report = await serverAuditService.auditServer(interaction.guild);
    
    const embed = new EmbedBuilder()
      .setTitle('Server Audit Report')
      .setColor(Colors.WARNING)
      .setDescription(`**Score:** ${report.score}/100\n\n**Recommendations:**\n${report.recommendations.join('\n') || 'None'}`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('admin_apply_recs').setLabel('Apply Recommendations').setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }

  if (customId === 'admin_create_channel') {
    const modal = new ModalBuilder()
      .setCustomId('modal_create_channel')
      .setTitle('Create Channel');
      
    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel('Channel Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
      
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
    await interaction.showModal(modal);
  }

  if (customId === 'admin_create_category') {
    const modal = new ModalBuilder()
      .setCustomId('modal_create_category')
      .setTitle('Create Category');
      
    const nameInput = new TextInputBuilder()
      .setCustomId('category_name')
      .setLabel('Category Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
      
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
    await interaction.showModal(modal);
  }
}

export default {
  customIdRegex: /^admin_/,
  execute: async (interaction: any) => {
    return handleServerManagementButtons(interaction);
  }
};
