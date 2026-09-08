import { ButtonInteraction } from 'discord.js';
import { requireAdmin } from '../../middleware/permissionGuard';
import { logger } from "../../utils/logger";

export async function handleAdminDashboardButton(interaction: ButtonInteraction) {
  try {
    await requireAdmin(interaction);
    
    const customId = interaction.customId;
    
    switch (customId) {
      case 'admin_members':
        await interaction.reply({ content: 'Member management panel coming soon.', ephemeral: true });
        break;
      case 'admin_verification':
        await interaction.reply({ content: 'Verification settings coming soon.', ephemeral: true });
        break;
      case 'admin_analytics':
        await interaction.reply({ content: 'Analytics dashboard coming soon.', ephemeral: true });
        break;
      case 'admin_audit_logs':
        await interaction.reply({ content: 'Audit logs coming soon.', ephemeral: true });
        break;
      case 'admin_settings':
        await interaction.reply({ content: 'Settings panel coming soon.', ephemeral: true });
        break;
      case 'admin_xp':
        await interaction.reply({ content: 'XP config coming soon.', ephemeral: true });
        break;
      case 'admin_games':
        await interaction.reply({ content: 'Game management coming soon.', ephemeral: true });
        break;
      case 'admin_server_struct':
        await interaction.deferReply({ ephemeral: true });
        try {
          const { setupService } = await import('../../services/SetupService');
          const botMember = await interaction.guild!.members.fetch(interaction.client.user!.id);
          const result = await setupService.quickSetup(interaction.guild!, botMember);
          await interaction.followUp({ content: `✅ Server Structure Built!\nChannels Created: ${result.channelsCreated.length}\nRoles Created: ${result.rolesCreated.length}` });
        } catch (e) {
          await interaction.followUp({ content: 'Failed to build server structure.' });
        }
        break;
      default:
        await interaction.reply({ content: 'Unknown action.', ephemeral: true });
    }
  } catch (error) {
    logger.error('Error in admin dashboard button:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred or you lack permissions.', ephemeral: true });
    }
  }
}

export default {
  customIdRegex: /^admin_/,
  execute: async (interaction: any) => {
    return handleAdminDashboardButton(interaction);
  }
};
