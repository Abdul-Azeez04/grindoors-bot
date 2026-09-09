import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { nftTriviaData } from './data/nftTrivia';

export class TriviaStreak extends GameEngine {
  private correctIndex: number = 0;
  private userStreaks = new Map<string, number>();

  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Trivia Streak';
  }

  public createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const questionData = nftTriviaData[Math.floor(Math.random() * nftTriviaData.length)];
    
    const optionsWithIndices = questionData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    this.correctIndex = shuffled.findIndex(opt => opt.originalIndex === questionData.correctIndex);

    const embed = new EmbedBuilder()
      .setTitle('🔥 Trivia Streak!')
      .setDescription(`**${questionData.question}**\n\nKeep answering correctly to build your streak!`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });

    const row = new ActionRowBuilder<ButtonBuilder>();
    shuffled.forEach((opt, index) => {
      row.addComponents(
        new ButtonBuilder().setCustomId(`game_ans_${index}`).setLabel(opt.text).setStyle(ButtonStyle.Primary)
      );
    });

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
    this.markAnswered(userId);
    const answerIndex = parseInt(answer.replace('game_ans_', ''), 10);
    const isCorrect = answerIndex === this.correctIndex;
    
    if (isCorrect) {
      const currentStreak = (this.userStreaks.get(userId) || 0) + 1;
      this.userStreaks.set(userId, currentStreak);
      const xp = currentStreak * 10;
      this.recordScore(userId, xp);
      return { correct: true, message: `✅ Correct! Your streak is now 🔥 ${currentStreak}. You earned ${xp} XP!` };
    } else {
      this.userStreaks.set(userId, 0);
      return { correct: false, message: `❌ Incorrect! Your streak has been broken.` };
    }
  }
}
