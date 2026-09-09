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
    await interaction.deferUpdate();
    const botMember = await guild.members.fetch(interaction.client.user!.id);
    const result = await setupService.quickSetup(guild, botMember);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Setup Complete')
      .setColor(Colors.SUCCESS)
      .setDescription('Server structure, roles, and community panels have been deployed.')
      .addFields(
        { name: 'Channels Created', value: `${result.channelsCreated.length}`, inline: true },
        { name: 'Roles Created', value: `${result.rolesCreated.length}`, inline: true },
        { name: 'Panels Deployed', value: `${result.panelsDeployed.length}`, inline: true }
      );
      
    if (result.errors.length > 0) {
      embed.addFields({ name: '⚠️ Errors', value: result.errors.slice(0, 5).join('\n') });
    }
    
    await interaction.editReply({ embeds: [embed], components: [] });
  }

  if (customId === 'setup_audit') {
    await interaction.deferUpdate();
    const report = await serverAuditService.auditServer(guild);
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Server Audit Report')
      .setColor(Colors.WARNING)
      .setDescription(`**Score:** ${report.score}/100\n\n**Recommendations:**\n${report.recommendations.join('\n') || 'None'}`);

    await interaction.editReply({ embeds: [embed], components: [] });
  }

  if (customId === 'setup_advanced') {
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Advanced Setup')
      .setColor(Colors.PRIMARY)
      .setDescription('Use `/admin` to open the interactive Admin Control Center and configure modules individually.');
      
    await interaction.update({ embeds: [embed], components: [] });
  }
}
