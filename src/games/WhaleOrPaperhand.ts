import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { cryptoScenarios } from './data/cryptoScenarios';

export class WhaleOrPaperhand extends GameEngine {
  private isWhale: boolean = false;
  private explanation: string = '';

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 15;
  }

  public getGameType(): string {
    return 'Whale or Paperhand';
  }

  public createQuestionEmbed() {
    const scenarios = cryptoScenarios.filter(s => s.isWhale !== undefined);
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.isWhale = scenario.isWhale!;
    this.explanation = scenario.explanation;

    const embed = new EmbedBuilder()
      .setTitle('🐋 Whale or 📄 Paperhand?')
      .setDescription(`**Scenario:**\n${scenario.scenario}\n\nWhat kind of behavior is this?`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_ans_whale').setLabel('🐋 WHALE').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('game_ans_paperhand').setLabel('📄 PAPERHAND').setStyle(ButtonStyle.Secondary)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
    this.markAnswered(userId);
    const answeredWhale = answer === 'game_ans_whale';
    const isCorrect = answeredWhale === this.isWhale;
    if (isCorrect) {
      return { correct: true, message: `✅ Spot on! You earned ${this.xpReward} XP!\n*${this.explanation}*` };
    } else {
      return { correct: false, message: `❌ Nope!\n*${this.explanation}*` };
    }
  }
}
