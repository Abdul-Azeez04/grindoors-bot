const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/HP/Downloads/public/ntrpy-discord-bot/src';
const gamesDir = path.join(baseDir, 'games');

const games = [
  'NFTTrivia', 'SpeedQuiz', 'WordScramble', 'GuessTheNumber',
  'MathRush', 'MemoryTest', 'EmojiMovie', 'EmojiSong', 'WhoAmI',
  'FindDifference', 'WordChain', 'Rumble', 'QuickDraw', 'CoinFlipWar',
  'DiceDuel', 'TriviaStreak', 'ScamOrLegit', 'WhaleOrPaperhand',
  'DailyChallenge', 'CommunityRiddle', 'TwoTruthsOneLie', 'UnscrambleNFT', 'FlagPuzzle'
];

const template = (name) => `import { GameEngine } from './GameEngine';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export class ${name} extends GameEngine {
  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 25;
  }
  
  getGameType(): string {
    return '${name.replace(/([A-Z])/g, ' $1').trim()}';
  }
  
  createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle(this.getGameType())
      .setDescription('Game content goes here.')
      .setColor(Colors.PRIMARY);
      
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('game_answer_0').setLabel('Option 1').setStyle(ButtonStyle.Primary)
    );
    
    return { embed, components: [row] };
  }
  
  handleAnswer(userId: string, answer: string): { correct: boolean, message: string } {
    return { correct: true, message: 'Correct!' };
  }
}
`;

for (const game of games) {
  const filePath = path.join(gamesDir, `${game}.ts`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(game));
    console.log(`Created ${game}.ts`);
  }
}
