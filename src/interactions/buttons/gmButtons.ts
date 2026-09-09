import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { gmService } from '../../services/GMService';
import { Colors } from '../../config/constants';

export async function handleGMButtons(interaction: ButtonInteraction): Promise<void> {
  if (!requireAdmin(interaction)) {
    await interaction.reply({ content: 'Missing permissions.', ephemeral: true });
    return;
  }

  const { customId, guildId, guild } = interaction;
  if (!guildId || !guild) return;

  if (customId === 'admin_gm') {
    const embed = new EmbedBuilder()
      .setTitle('☀️ GM Manager')
      .setColor(Colors.PRIMARY)
      .setDescription('Manage daily GM posts and quotes.');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('gm_add_quote').setLabel('Add Quote').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('gm_view_quotes').setLabel('View Quotes').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gm_preview').setLabel('Preview GM').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gm_post_now').setLabel('Post Now').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  if (customId === 'gm_add_quote') {
    const modal = new ModalBuilder().setCustomId('modal_add_quote').setTitle('Add GM Quote');
    const textInput = new TextInputBuilder().setCustomId('quote_text').setLabel('Quote Text').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const authorInput = new TextInputBuilder().setCustomId('quote_author').setLabel('Author (Optional)').setStyle(TextInputStyle.Short).setRequired(false);
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(authorInput)
    );
    await interaction.showModal(modal);
  }

  if (customId === 'gm_view_quotes') {
    const quotes = await gmService.getQuotes(guildId);
    const desc = quotes.length > 0 ? quotes.map(q => `**${q.id}**: ${q.text} ${q.author ? `- ${q.author}` : ''}`).join('\n') : 'No quotes added yet.';
    
    const embed = new EmbedBuilder()
      .setTitle('GM Quotes')
      .setColor(Colors.PRIMARY)
      .setDescription(desc.substring(0, 4000));
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'gm_preview') {
    const quote = await gmService.getRandomQuote(guildId);
    if (!quote) {
      await interaction.reply({ content: 'No quotes available.', ephemeral: true });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('☀️ Good Morning! (Preview)')
      .setColor(Colors.PRIMARY)
      .setDescription(quote.text)
      .setFooter({ text: quote.author ? `- ${quote.author}` : 'Daily GM' });
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'gm_post_now') {
    await interaction.deferReply({ ephemeral: true });
    await gmService.postDailyGM(guild, guildId);
    await interaction.editReply({ content: 'GM posted successfully.' });
  }
}

export default {
  customIdRegex: /^gm_/,
  execute: async (interaction: any) => {
    return handleGMButtons(interaction);
  }
};
