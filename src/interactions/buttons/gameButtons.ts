import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { GameManager } from '../../games/GameManager';
import { logger } from '../../utils/logger';
import { prisma } from '../../database/client';
import { Colors } from '../../config/constants';

export const handleGameButtons = async (interaction: ButtonInteraction) => {
  const customId = interaction.customId;
  const channelId = interaction.channelId;
  
  if (customId.startsWith('game_answer_')) {
    const game = GameManager.getActiveGame(channelId);
    
    if (!game) {
      return interaction.reply({ content: 'No active game found in this channel.', ephemeral: true });
    }
    
    if (game.status !== 'ACTIVE') {
      return interaction.reply({ content: 'This game has already ended.', ephemeral: true });
    }
    
    if (game.hasAnswered(interaction.user.id)) {
      return interaction.reply({ content: 'You have already answered!', ephemeral: true });
    }
    
    const answer = customId.replace('game_answer_', '');
    const result = game.handleAnswer(interaction.user.id, answer);
    
    game.markAnswered(interaction.user.id);
    
    await interaction.reply({ content: result.message, ephemeral: true });
    return;
  }
  
  // Other buttons
  switch(customId) {
    case 'game_leaderboard':
      if (!interaction.guildId) return interaction.reply({ content: 'Must be used in a server', ephemeral: true });
      try {
        const topPlayers = await prisma.member.findMany({ 
          where: { guildId: interaction.guildId }, 
          orderBy: { totalGamesWon: 'desc' }, 
          take: 10 
        });
        const embed = new EmbedBuilder()
          .setTitle('🏆 Top 10 Game Players')
          .setColor(Colors.PRIMARY)
          .setDescription(topPlayers.length > 0 
            ? topPlayers.map((p, i) => `**${i + 1}.** <@${p.discordId}> - ${p.totalGamesWon} Wins`).join('\n')
            : 'No game data available yet.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (err) {
        logger.error('Error fetching game leaderboard', err);
        return interaction.reply({ content: 'Failed to fetch leaderboard.', ephemeral: true });
      }
    case 'game_daily':
      return interaction.reply({ content: 'Head to the #game-lobby to start playing games!', ephemeral: true });
    default:
      logger.warn(`Unknown game button: ${customId}`);
      return interaction.reply({ content: 'Unknown action.', ephemeral: true });
  }
};
export default { customIdRegex: /^game_/, execute: async (interaction: any) => { return handleGameButtons(interaction); } };
