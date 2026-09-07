import { ModalSubmitInteraction } from 'discord.js';
import { ReportService } from '../../services/ReportService';

export async function handleReportModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId === 'modal_report') {
    const category = interaction.fields.getTextInputValue('report_category');
    const targetId = interaction.fields.getTextInputValue('report_target');
    const description = interaction.fields.getTextInputValue('report_description');

    if (!interaction.guild) return;

    try {
      const report = await ReportService.createReport(interaction.guild.id, interaction.user.id, category, description, targetId || undefined);
      await ReportService.sendReportToStaff(interaction.guild, report);
      await interaction.reply({ content: '✅ Report submitted. Our team will review it.', ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Failed to submit report.', ephemeral: true });
    }
  }
}
