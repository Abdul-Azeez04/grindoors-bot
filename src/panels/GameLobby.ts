import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export const createGameLobby = () => {
  const embed = new EmbedBuilder()
    .setTitle('🎮 GAME LOBBY')
    .setDescription('Select a game to play and earn XP!')
    .setColor(Colors.PRIMARY);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_game')
    .setPlaceholder('Choose a game...')
    .addOptions([
      { label: 'Flag Guess', value: 'flag_guess', description: 'Guess the country by its flag' },
      { label: 'NFT Trivia', value: 'nft_trivia', description: 'Test your crypto and NFT knowledge' },
    ]);

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('game_leaderboard')
      .setLabel('🏆 LEADERBOARD')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('game_daily')
      .setLabel('🔥 DAILY CHALLENGE')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [selectRow, buttonRow] };
};
