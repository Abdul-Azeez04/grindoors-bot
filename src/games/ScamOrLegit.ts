import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { cryptoScenarios } from './data/cryptoScenarios';

export class ScamOrLegit extends GameEngine {
  private isScam: boolean = false;
  private explanation: string = '';

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Scam or Legit';
  }

  public createQuestionEmbed() {
    const scenarios = cryptoScenarios.filter(s => s.isScam !== undefined);
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.isScam = scenario.isScam!;
    this.explanation = scenario.explanation;

    const embed = new EmbedBuilder()
      .setTitle('🕵️ Scam or Legit?')
      .setDescription(`**Scenario:**\n${scenario.scenario}\n\nIs this a scam or a legitimate opportunity?`)
      .setColor(Colors.WARNING)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_ans_scam').setLabel('🚨 SCAM').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('game_ans_legit').setLabel('✅ LEGIT').setStyle(ButtonStyle.Success)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered this question!' };
    this.markAnswered(userId);
    const answeredScam = answer === 'game_ans_scam';
    const isCorrect = answeredScam === this.isScam;
    if (isCorrect) {
      return { correct: true, message: `✅ Correct! You earned ${this.xpReward} XP!\n*Explanation: ${this.explanation}*` };
    } else {
      return { correct: false, message: `❌ Incorrect!\n*Explanation: ${this.explanation}*` };
    }
  }
}
