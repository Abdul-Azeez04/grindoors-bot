import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class DailyChallenge extends GameEngine {
  private lastDailyDate = new Map<string, string>();

  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 50;
  }

  public getGameType(): string {
    return 'Daily Challenge';
  }

  public createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle('📅 Daily Challenge')
      .setDescription('Claim your daily bonus XP! Come back tomorrow for more.')
      .setColor(Colors.SUCCESS)
      .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_ans_claim').setLabel('CLAIM BONUS').setStyle(ButtonStyle.Success)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    const today = new Date().toDateString();
    if (this.lastDailyDate.get(userId) === today) {
      return { correct: false, message: 'You already claimed your Daily Challenge bonus today!' };
    }
    
    this.lastDailyDate.set(userId, today);
    this.recordScore(userId, this.xpReward);
    return { correct: true, message: `✅ You claimed your Daily Challenge! +${this.xpReward} XP!` };
  }
}
