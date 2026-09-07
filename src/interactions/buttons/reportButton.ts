import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export async function handleReportButton(interaction: ButtonInteraction) {
  if (interaction.customId === 'report_create') {
    const modal = new ModalBuilder()
      .setCustomId('modal_report')
      .setTitle('Create a Report');

    const categoryInput = new TextInputBuilder()
      .setCustomId('report_category')
      .setLabel('Category (SPAM, HARASSMENT, etc.)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const targetInput = new TextInputBuilder()
      .setCustomId('report_target')
      .setLabel('Target User ID (Optional)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('report_description')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(targetInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
    );

    await interaction.showModal(modal);
  }
}
