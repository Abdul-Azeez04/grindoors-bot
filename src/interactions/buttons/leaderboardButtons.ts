import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { LeaderboardService } from '../../services/LeaderboardService';
import { Colors } from '../../config/constants';
import logger from '../../utils/logger';

export async function handleLeaderboardButton(interaction: ButtonInteraction) {
  try {
    await interaction.deferUpdate();
    if (!interaction.guildId) return;

    const customId = interaction.customId;
    let data;
    let valueField = '';
    let valueLabel = '';
    let title = '';

    switch (customId) {
      case 'lb_xp':
        data = await LeaderboardService.getXPLeaderboard(interaction.guildId);
        valueField = 'xp';
        valueLabel = 'XP';
        title = 'Top XP';
        break;
      case 'lb_games':
        data = await LeaderboardService.getGameLeaderboard(interaction.guildId);
        valueField = 'totalGamesWon';
        valueLabel = 'Wins';
        title = 'Top Game Winners';
        break;
      case 'lb_streak':
        data = await LeaderboardService.getStreakLeaderboard(interaction.guildId);
        valueField = 'dailyStreak';
        valueLabel = 'Days';
        title = 'Top Daily Streaks';
        break;
      case 'lb_weekly':
        data = await LeaderboardService.getWeeklyXPLeaderboard(interaction.guildId);
        valueField = 'xpEarned';
        valueLabel = 'XP';
        title = 'Weekly Top XP';
        break;
      default:
        return;
    }

    const formatted = LeaderboardService.formatLeaderboard(data, valueField, valueLabel);
    
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${title}`)
      .setDescription(formatted)
      .setColor(Colors.PRIMARY)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error handling leaderboard button:', error);
  }
}
