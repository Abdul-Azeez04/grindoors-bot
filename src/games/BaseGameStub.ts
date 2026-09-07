import { GameEngine } from './GameEngine';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export class BaseGameStub extends GameEngine {
  private gameName: string;
  private correctAnswer: string;
  
  constructor(guildId: string, channelId: string, gameName: string, xpReward: number) {
    super(guildId, channelId);
    this.gameName = gameName;
    this.xpReward = xpReward;
    this.correctAnswer = 'Option 1'; // Fixed for stub
  }
  
  getGameType(): string {
    return this.gameName;
  }
  
  createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle(this.gameName)
      .setDescription('Pick the correct option to win!')
      .setColor(Colors.PRIMARY);
      
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('game_answer_Option 1').setLabel('Option 1 (Correct)').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('game_answer_Option 2').setLabel('Option 2').setStyle(ButtonStyle.Secondary)
    );
    
    return { embed, components: [row] };
  }
  
  handleAnswer(userId: string, answer: string): { correct: boolean, message: string } {
    if (answer === this.correctAnswer) {
      if (!this.players.has(userId)) {
        this.players.set(userId, { score: 0, answered: true });
      }
      this.players.get(userId)!.score += this.xpReward;
      return { correct: true, message: `Correct! You earned ${this.xpReward} XP.` };
    }
    return { correct: false, message: 'Wrong!' };
  }
}
