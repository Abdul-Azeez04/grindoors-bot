import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { riddlesData as puzzlesData } from './data/puzzlesData';

export class CommunityRiddle extends GameEngine {
  private correctIndex: number = 0;

  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Community Riddle';
  }

  public createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const riddle = puzzlesData[Math.floor(Math.random() * puzzlesData.length)];
    
    const optionsWithIndices = riddle.options.map((opt, idx) => ({ text: opt, isCorrect: idx === riddle.correctIndex }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    
    this.correctIndex = shuffled.findIndex(opt => opt.isCorrect);

    const embed = new EmbedBuilder()
      .setTitle('🤔 Community Riddle')
      .setDescription(`**Riddle:**\n${riddle.question}`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });

    const row = new ActionRowBuilder<ButtonBuilder>();
    shuffled.forEach((opt, index) => {
      row.addComponents(
        new ButtonBuilder().setCustomId(`game_ans_${index}`).setLabel(opt.text).setStyle(ButtonStyle.Secondary)
      );
    });

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered this riddle!' };
    this.markAnswered(userId);
    
    const answerIndex = parseInt(answer.replace('game_ans_', ''), 10);
    if (answerIndex === this.correctIndex) {
      this.recordScore(userId, this.xpReward);
      return { correct: true, message: `✅ Correct! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ Incorrect! Better luck next time.` };
    }
  }
}
