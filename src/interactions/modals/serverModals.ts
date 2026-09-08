import { ModalSubmitInteraction, EmbedBuilder, ChannelType } from 'discord.js';
import { channelService } from '../../services/ChannelService';
import { logger } from '../../utils/logger';
import { Colors } from '../../config/constants';

export const customIdRegex = /^modal_create_/;

export const execute = async (interaction: ModalSubmitInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.memberPermissions?.has('Administrator')) {
      return interaction.editReply('❌ You do not have permission to perform this action.');
    }

    if (interaction.customId === 'modal_create_channel') {
      const name = interaction.fields.getTextInputValue('channel_name');
      // Create a standard text channel
      await channelService.createChannel(interaction.guild!, name, ChannelType.GuildText);
      await interaction.editReply(`✅ Successfully created text channel: **#${name}**`);
    }
    else if (interaction.customId === 'modal_create_category') {
      const name = interaction.fields.getTextInputValue('category_name');
      await channelService.createCategory(interaction.guild!, name);
      await interaction.editReply(`✅ Successfully created category: **${name}**`);
    }
    else {
      await interaction.editReply(`❌ Unknown setup action: ${interaction.customId}`);
    }
  } catch (error: any) {
    logger.error('Error handling server setup modal:', error);
    await interaction.editReply(`❌ Failed to create: ${error.message}`);
  }
};
