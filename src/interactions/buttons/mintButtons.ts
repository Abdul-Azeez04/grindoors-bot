import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { mintService } from '../../services/MintService';
import { createMintBoard } from '../../panels/MintBoard';
import { Colors } from '../../config/constants';

export async function handleMintButtons(interaction: ButtonInteraction) {
  if (!requireAdmin(interaction)) {
    return interaction.reply({ content: 'Missing permissions.', ephemeral: true });
  }

  const { customId, guildId } = interaction;
  if (!guildId) return;

  if (customId === 'admin_mints' || customId === 'mint_all') {
    const mints = await mintService.getUpcomingMints(guildId);
    const board = createMintBoard(mints);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(board);
    } else {
      await interaction.reply({ ...board, ephemeral: true });
    }
  }

  if (customId === 'mint_add') {
    const modal = new ModalBuilder().setCustomId('modal_add_mint').setTitle('Add Mint');
    
    const projectName = new TextInputBuilder().setCustomId('projectName').setLabel('Project Name').setStyle(TextInputStyle.Short).setRequired(true);
    const chain = new TextInputBuilder().setCustomId('chain').setLabel('Chain (e.g. ETH, SOL)').setStyle(TextInputStyle.Short).setRequired(true);
    const mintTime = new TextInputBuilder().setCustomId('mintTime').setLabel('Mint Time (ISO 8601 string)').setStyle(TextInputStyle.Short).setRequired(true);
    const price = new TextInputBuilder().setCustomId('price').setLabel('Price').setStyle(TextInputStyle.Short).setRequired(true);
    const description = new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(projectName),
      new ActionRowBuilder<TextInputBuilder>().addComponents(chain),
      new ActionRowBuilder<TextInputBuilder>().addComponents(mintTime),
      new ActionRowBuilder<TextInputBuilder>().addComponents(price),
      new ActionRowBuilder<TextInputBuilder>().addComponents(description)
    );

    await interaction.showModal(modal);
  }

  if (customId === 'mint_today') {
    const mints = await mintService.getTodayMints(guildId);
    const board = createMintBoard(mints);
    await interaction.update(board);
  }

  if (customId === 'mint_tomorrow') {
    const mints = await mintService.getTomorrowMints(guildId);
    const board = createMintBoard(mints);
    await interaction.update(board);
  }

  if (customId.startsWith('mint_delete_')) {
    const mintId = parseInt(customId.split('_')[2]);
    await mintService.deleteMint(mintId);
    await interaction.reply({ content: 'Mint deleted.', ephemeral: true });
  }
}

export default {
  customIdRegex: /.*/,
  execute: async (interaction: any) => {
    return handleMintButtons(interaction);
  }
};
