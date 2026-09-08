import { ButtonInteraction } from 'discord.js';
import { GameManager } from '../../games/GameManager';
import { logger } from '../../utils/logger';

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
      return interaction.reply({ content: 'Leaderboard coming soon!', ephemeral: true });
    case 'game_daily':
      return interaction.reply({ content: 'Daily Challenge coming soon!', ephemeral: true });
    default:
      logger.warn(`Unknown game button: ${customId}`);
      return interaction.reply({ content: 'Unknown action.', ephemeral: true });
  }
};
export default { customIdRegex: /^game_/, execute: async (interaction: any) => { return handleGameButtons(interaction); } };
