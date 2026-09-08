import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { setupService } from '../../services/SetupService';
import { serverAuditService } from '../../services/ServerAuditService';
import { Colors } from '../../config/constants';

export default {
  customIdRegex: /^setup_/,
  execute: async (interaction: ButtonInteraction) => {
    return handleSetupButtons(interaction);
  }
};

export async function handleSetupButtons(interaction: ButtonInteraction) {
  const { customId, guild } = interaction;
  if (!guild) return;

  if (customId === 'setup_quick') {
    await interaction.deferReply({ ephemeral: true });
    const botMember = await guild.members.fetch(interaction.client.user!.id);
    const result = await setupService.quickSetup(guild, botMember);
    
    const embed = new EmbedBuilder()
      .setTitle('Setup Complete')
      .setColor(Colors.SUCCESS)
      .addFields(
        { name: 'Channels Created', value: result.channelsCreated.length.toString(), inline: true },
        { name: 'Roles Created', value: result.rolesCreated.length.toString(), inline: true },
        { name: 'Panels Deployed', value: result.panelsDeployed.length.toString(), inline: true }
      );
      
    if (result.errors.length > 0) {
      embed.addFields({ name: 'Errors', value: result.errors.join('\n') });
    }
    
    await interaction.editReply({ embeds: [embed] });
  }

  if (customId === 'setup_audit') {
    await interaction.deferReply({ ephemeral: true });
    const report = await serverAuditService.auditServer(guild);
    
    const embed = new EmbedBuilder()
      .setTitle('Server Audit Report')
      .setColor(Colors.WARNING)
      .setDescription(`**Score:** ${report.score}/100\n\n**Recommendations:**\n${report.recommendations.join('\n') || 'None'}`);

    await interaction.editReply({ embeds: [embed] });
  }

  if (customId === 'setup_advanced') {
    const embed = new EmbedBuilder()
      .setTitle('Advanced Setup')
      .setColor(Colors.PRIMARY)
      .setDescription('Use the admin dashboard to configure modules individually.');
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
