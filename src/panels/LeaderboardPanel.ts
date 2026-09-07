import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';
import { LeaderboardService } from '../services/LeaderboardService';

export async function createLeaderboardPanel(guildId: string) {
  const topXP = await LeaderboardService.getXPLeaderboard(guildId, 10);
  const formattedLeaderboard = LeaderboardService.formatLeaderboard(topXP, 'xp', 'XP');

  const embed = new EmbedBuilder()
    .setTitle('🏆 COMMUNITY LEADERBOARD')
    .setDescription(`**Top 10 XP Leaders**\n\n${formattedLeaderboard}`)
    .setColor(Colors.PRIMARY)
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('lb_xp').setLabel('🏆 XP').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lb_games').setLabel('🎮 Games').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('lb_streak').setLabel('🔥 Streak').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('lb_weekly').setLabel('⚡ Weekly').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}
