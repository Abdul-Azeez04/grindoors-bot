import { ButtonInteraction } from 'discord.js';
import { logger } from "../../utils/logger";

export async function handleHubButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;
    
    switch (customId) {
      case 'hub_verify':
        const role = interaction.guild!.roles.cache.find(r => r.name === 'Verified');
        if (role && interaction.member && 'roles' in interaction.member) {
          await (interaction.member.roles as any).add(role);
          await interaction.reply({ content: '✅ You have been successfully verified! Welcome to Grindoors!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Could not find the Verified role. Please contact an admin.', ephemeral: true });
        }
        break;
      case 'hub_support':
        await interaction.reply({ content: 'Ticket system would open here.', ephemeral: true });
        break;
      case 'hub_games':
        await interaction.reply({ content: 'Game lobby would open here.', ephemeral: true });
        break;
      case 'hub_leaderboard':
        await interaction.reply({ content: 'Leaderboard loading...', ephemeral: true });
        break;
      case 'hub_mints':
        await interaction.reply({ content: 'Mints page would open here.', ephemeral: true });
        break;
      case 'hub_rules':
        await interaction.reply({ content: 'Server rules...', ephemeral: true });
        break;
      case 'hub_profile':
        await interaction.reply({ content: 'Use /profile to view your profile.', ephemeral: true });
        break;
      case 'hub_daily':
        await interaction.reply({ content: 'Daily challenge started.', ephemeral: true });
        break;
      case 'hub_stats':
        await interaction.reply({ content: 'Community stats...', ephemeral: true });
        break;
      default:
        await interaction.reply({ content: 'Unknown action.', ephemeral: true });
    }
  } catch (error) {
    logger.error('Error handling hub button:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
}

export default {
  customIdRegex: /^hub_/,
  execute: async (interaction: any) => {
    return handleHubButton(interaction);
  }
};
