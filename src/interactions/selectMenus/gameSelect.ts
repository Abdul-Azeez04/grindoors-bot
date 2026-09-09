import { StringSelectMenuInteraction, TextChannel } from 'discord.js';
import { GameManager } from '../../games/GameManager';
import { FlagGuess } from '../../games/FlagGuess';
import { NFTTrivia } from '../../games/NFTTrivia';
import { CoinFlipWar } from '../../games/CoinFlipWar';
import { SpeedQuiz } from '../../games/SpeedQuiz';
import { WordScramble } from '../../games/WordScramble';
import { GuessTheNumber } from '../../games/GuessTheNumber';
import { MathRush } from '../../games/MathRush';
import { MemoryTest } from '../../games/MemoryTest';
import { EmojiMovie } from '../../games/EmojiMovie';
import { EmojiSong } from '../../games/EmojiSong';
import { WhoAmI } from '../../games/WhoAmI';
import { FindDifference } from '../../games/FindDifference';
import { WordChain } from '../../games/WordChain';
import { Rumble } from '../../games/Rumble';
import { QuickDraw } from '../../games/QuickDraw';
import { DiceDuel } from '../../games/DiceDuel';
import { TriviaStreak } from '../../games/TriviaStreak';
import { ScamOrLegit } from '../../games/ScamOrLegit';
import { WhaleOrPaperhand } from '../../games/WhaleOrPaperhand';
import { DailyChallenge } from '../../games/DailyChallenge';
import { CommunityRiddle } from '../../games/CommunityRiddle';
import { TwoTruthsOneLie } from '../../games/TwoTruthsOneLie';
import { UnscrambleNFT } from '../../games/UnscrambleNFT';
import { FlagPuzzle } from '../../games/FlagPuzzle';


export const handleGameSelect = async (interaction: StringSelectMenuInteraction): Promise<void> => {
  const gameType = interaction.values[0];
  const channel = interaction.channel as TextChannel;
  
  if (!channel) {
    await interaction.reply({ content: 'Games can only be played in text channels.', ephemeral: true });
    return;
  }

  if (GameManager.getActiveGame(channel.id)) {
    await interaction.reply({ content: 'There is already an active game in this channel!', ephemeral: true });
    return;
  }

  let game;
  switch (gameType) {
    case 'flagguess': case 'flag_guess': game = new FlagGuess(interaction.guildId!, channel.id); break;
    case 'nfttrivia': case 'nft_trivia': game = new NFTTrivia(interaction.guildId!, channel.id); break;
    case 'coinflipwar': game = new CoinFlipWar(interaction.guildId!, channel.id); break;
    case 'speedquiz': game = new SpeedQuiz(interaction.guildId!, channel.id); break;
    case 'wordscramble': game = new WordScramble(interaction.guildId!, channel.id); break;
    case 'guessthenumber': game = new GuessTheNumber(interaction.guildId!, channel.id); break;
    case 'mathrush': game = new MathRush(interaction.guildId!, channel.id); break;
    case 'memorytest': game = new MemoryTest(interaction.guildId!, channel.id); break;
    case 'emojimovie': game = new EmojiMovie(interaction.guildId!, channel.id); break;
    case 'emojisong': game = new EmojiSong(interaction.guildId!, channel.id); break;
    case 'whoami': game = new WhoAmI(interaction.guildId!, channel.id); break;
    case 'finddifference': game = new FindDifference(interaction.guildId!, channel.id); break;
    case 'wordchain': game = new WordChain(interaction.guildId!, channel.id); break;
    case 'rumble': game = new Rumble(interaction.guildId!, channel.id); break;
    case 'quickdraw': game = new QuickDraw(interaction.guildId!, channel.id); break;
    case 'diceduel': game = new DiceDuel(interaction.guildId!, channel.id); break;
    case 'triviastreak': game = new TriviaStreak(interaction.guildId!, channel.id); break;
    case 'scamorlegit': game = new ScamOrLegit(interaction.guildId!, channel.id); break;
    case 'whaleorpaperhand': game = new WhaleOrPaperhand(interaction.guildId!, channel.id); break;
    case 'dailychallenge': game = new DailyChallenge(interaction.guildId!, channel.id); break;
    case 'communityriddle': game = new CommunityRiddle(interaction.guildId!, channel.id); break;
    case 'twotruthsonelie': game = new TwoTruthsOneLie(interaction.guildId!, channel.id); break;
    case 'unscramblenft': game = new UnscrambleNFT(interaction.guildId!, channel.id); break;
    case 'flagpuzzle': game = new FlagPuzzle(interaction.guildId!, channel.id); break;

    default:
      await interaction.reply({ content: 'Game not implemented yet!', ephemeral: true });
      return;
  }

  GameManager.setActiveGame(channel.id, game);
  await interaction.deferUpdate();
  await game.start(channel);
};
export default { customIdRegex: /^select_game/, execute: async (interaction: any) => { return handleGameSelect(interaction); } };