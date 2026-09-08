import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class CoinFlipWar extends GameEngine {
  private result: string;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 15;
    this.result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
  }

  public getGameType(): string {
    return 'Coin Flip War';
  }

  public createQuestionEmbed() {
    const embed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip War')
      .setDescription(`Will it be Heads or Tails? Choose your side!`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_ans_heads').setLabel('HEADS').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('game_ans_tails').setLabel('TAILS').setStyle(ButtonStyle.Secondary)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already guessed!' };
    this.markAnswered(userId);
    const guess = answer === 'game_ans_heads' ? 'HEADS' : 'TAILS';
    const isCorrect = guess === this.result;
    
    if (isCorrect) {
      return { correct: true, message: `✅ It was ${this.result}! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ It was ${this.result}! Better luck next time.` };
    }
  }
}
