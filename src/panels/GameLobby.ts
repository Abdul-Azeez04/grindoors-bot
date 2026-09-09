import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export const createGameLobby = () => {
  const embed = new EmbedBuilder()
    .setTitle('🎮 GAME LOBBY')
    .setDescription('Select a game to play and earn XP!')
    .setColor(Colors.PRIMARY);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_game')
    .setPlaceholder('Choose a game to play...')
    .addOptions([
      { label: '🚩 Flag Guess', value: 'flag_guess', description: 'Guess the country by its flag' },
      { label: '🧩 Flag Puzzle', value: 'flagpuzzle', description: 'Unscramble the country flag' },
      { label: '🧠 NFT Trivia', value: 'nft_trivia', description: 'Test your crypto and NFT knowledge' },
      { label: '⚡ Speed Quiz', value: 'speedquiz', description: 'Fast-paced crypto questions' },
      { label: '🪙 Coin Flip War', value: 'coinflipwar', description: 'Heads or Tails high-stakes duel' },
      { label: '🎲 Dice Duel', value: 'diceduel', description: 'Roll higher than the house' },
      { label: '🔢 Guess The Number', value: 'guessthenumber', description: 'Guess the secret number 1-100' },
      { label: '➗ Math Rush', value: 'mathrush', description: 'Solve quick mental math' },
      { label: '🔤 Word Scramble', value: 'wordscramble', description: 'Unscramble the crypto term' },
      { label: '🖼️ Unscramble NFT', value: 'unscramblenft', description: 'Unscramble famous NFT project names' },
      { label: '🎬 Emoji Movie', value: 'emojimovie', description: 'Guess the movie from emojis' },
      { label: '🎵 Emoji Song', value: 'emojisong', description: 'Guess the song from emojis' },
      { label: '🕵️ Who Am I', value: 'whoami', description: 'Identify the crypto personality' },
      { label: '🔍 Find Difference', value: 'finddifference', description: 'Spot the odd emoji out' },
      { label: '🔗 Word Chain', value: 'wordchain', description: 'Chain words together' },
      { label: '⚔️ Rumble', value: 'rumble', description: 'Multiplayer battle royale' },
      { label: '🤠 Quick Draw', value: 'quickdraw', description: 'Fastest click wins' },
      { label: '🔥 Trivia Streak', value: 'triviastreak', description: 'How many can you answer in a row?' },
      { label: '🚨 Scam or Legit', value: 'scamorlegit', description: 'Spot the phishing attempt' },
      { label: '🐋 Whale or Paperhand', value: 'whaleorpaperhand', description: 'Test your trading mentality' },
      { label: '🎯 Two Truths One Lie', value: 'twotruthsonelie', description: 'Spot the fake crypto fact' },
      { label: '🤔 Community Riddle', value: 'communityriddle', description: 'Solve the community riddle' },
      { label: '📅 Daily Challenge', value: 'dailychallenge', description: 'Daily challenge for bonus XP' },
      { label: '🧠 Memory Test', value: 'memorytest', description: 'Remember the sequence' }
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
