import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class DiceDuel extends GameEngine {
  private diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Dice Duel';
  }

  public createQuestionEmbed() {
    const embed = new EmbedBuilder()
      .setTitle('🎲 Dice Duel')
      .setDescription(`Roll the dice! Highest roll wins.`)
      .setColor(Colors.Info)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_ans_roll').setLabel('ROLL DICE').setStyle(ButtonStyle.Primary)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already rolled!' };
    this.markAnswered(userId);
    
    const botRoll = Math.floor(Math.random() * 6);
    const userRoll = Math.floor(Math.random() * 6);
    
    const isWin = userRoll > botRoll;

    if (isWin) {
      return { correct: true, message: `✅ You rolled ${this.diceEmojis[userRoll]} vs Bot's ${this.diceEmojis[botRoll]}! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ You rolled ${this.diceEmojis[userRoll]} vs Bot's ${this.diceEmojis[botRoll]}! You lost.` };
    }
  }
}
