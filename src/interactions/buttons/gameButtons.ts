import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { GameManager } from '../../games/GameManager';
import { logger } from '../../utils/logger';
import { prisma } from '../../database/client';
import { Colors } from '../../config/constants';

export const handleGameButtons = async (interaction: ButtonInteraction): Promise<void> => {
  const customId = interaction.customId;
  const channelId = interaction.channelId;

  // Handle active game answers or interactions
  if (customId.startsWith('game_ans_') || customId.startsWith('game_answer_') || customId === 'game_join_rumble') {
    const game = GameManager.getActiveGame(channelId);
    
    if (!game) {
      await interaction.reply({ content: 'No active game found in this channel.', ephemeral: true });
      return;
    }
    
    if (game.status !== 'ACTIVE') {
      await interaction.reply({ content: 'This game has already ended.', ephemeral: true });
      return;
    }
    
    if (game.hasAnswered(interaction.user.id) && customId !== 'game_join_rumble') {
      await interaction.reply({ content: 'You have already answered!', ephemeral: true });
      return;
    }
    
    const result = game.handleAnswer(interaction.user.id, customId);
    await interaction.reply({ content: result.message, ephemeral: true });
    return;
  }
  
  // Other static game buttons
  switch(customId) {
    case 'game_leaderboard':
      if (!interaction.guildId) {
        await interaction.reply({ content: 'Must be used in a server', ephemeral: true });
        return;
      }
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
            ? topPlayers.map((p: any, i: number) => `**${i + 1}.** <@${p.discordId}> - ${p.totalGamesWon} Wins`).join('\n')
            : 'No game data available yet.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      } catch (err) {
        logger.error('Error fetching game leaderboard', err);
        await interaction.reply({ content: 'Failed to fetch leaderboard.', ephemeral: true });
        return;
      }
    case 'game_daily':
      await interaction.reply({ content: 'Head to the #game-lobby to start playing games!', ephemeral: true });
      return;
    default:
      logger.warn(`Unknown game button: ${customId}`);
      await interaction.reply({ content: 'Unknown action.', ephemeral: true });
      return;
  }
};

export default {
  customIdRegex: /^game_/,
  execute: async (interaction: any) => {
    return handleGameButtons(interaction);
  }
};
