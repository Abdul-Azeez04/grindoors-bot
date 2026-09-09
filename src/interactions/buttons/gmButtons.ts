import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { gmService } from '../../services/GMService';
import { Colors } from '../../config/constants';

function gmNavRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_gm').setLabel('🔙 Back to GM Menu').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('admin_back_main').setLabel('🏠 Admin Menu').setStyle(ButtonStyle.Secondary)
  );
}

export async function handleGMButtons(interaction: ButtonInteraction): Promise<void> {
  if (!requireAdmin(interaction)) {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: 'Missing permissions.' });
    } else {
      await interaction.reply({ content: 'Missing permissions.', ephemeral: true });
    }
    return;
  }

  const { customId, guildId, guild } = interaction;
  if (!guildId || !guild) return;

  if (customId === 'admin_gm') {
    const embed = new EmbedBuilder()
      .setTitle('☀️ GM Manager')
      .setColor(Colors.PRIMARY)
      .setDescription('Manage daily GM posts, quotes, and morning greetings.');

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('gm_add_quote').setLabel('➕ Add Quote').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('gm_view_quotes').setLabel('📜 View Quotes').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gm_preview').setLabel('👁 Preview GM').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gm_post_now').setLabel('🚀 Post Now').setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('admin_back_main').setLabel('🔙 Back to Admin Menu').setStyle(ButtonStyle.Secondary)
    );

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed], components: [row1, row2] });
    } else {
      await interaction.update({ embeds: [embed], components: [row1, row2] });
    }
    return;
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
    return;
  }

  if (customId === 'gm_view_quotes') {
    await interaction.deferUpdate();
    const quotes = await gmService.getQuotes(guildId);
    const desc = quotes.length > 0 ? quotes.map(q => `**${q.id}**: ${q.text} ${q.author ? `- ${q.author}` : ''}`).join('\n') : 'No quotes added yet.';
    
    const embed = new EmbedBuilder()
      .setTitle('📜 GM Quotes Library')
      .setColor(Colors.PRIMARY)
      .setDescription(desc.substring(0, 4000));
      
    await interaction.editReply({ embeds: [embed], components: [gmNavRow()] });
    return;
  }

  if (customId === 'gm_preview') {
    await interaction.deferUpdate();
    const quote = await gmService.getRandomQuote(guildId);
    if (!quote) {
      const embed = new EmbedBuilder()
        .setTitle('☀️ GM Preview')
        .setColor(Colors.WARNING)
        .setDescription('No quotes available in database yet. Click **Add Quote** to add one!');
      await interaction.editReply({ embeds: [embed], components: [gmNavRow()] });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('☀️ Good Morning! (Live Preview)')
      .setColor(Colors.PRIMARY)
      .setDescription(`> "${quote.text}"\n\n— **${quote.author || 'Daily GM'}**`)
      .setFooter({ text: 'Daily GM Automation Preview' });
      
    await interaction.editReply({ embeds: [embed], components: [gmNavRow()] });
    return;
  }

  if (customId === 'gm_post_now') {
    await interaction.deferUpdate();
    await gmService.postDailyGM(guild, guildId);
    const embed = new EmbedBuilder()
      .setTitle('☀️ GM Posted')
      .setColor(Colors.SUCCESS)
      .setDescription('✅ Daily GM announcement successfully posted to the configured `#gm` channel!');
    await interaction.editReply({ embeds: [embed], components: [gmNavRow()] });
    return;
  }
}

export default {
  customIdRegex: /^gm_/,
  execute: async (interaction: any) => {
    return handleGMButtons(interaction);
  }
};
