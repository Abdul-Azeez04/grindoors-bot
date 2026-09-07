import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { nftTriviaData } from './data/nftTrivia';

export class NFTTrivia extends GameEngine {
  private correctIndex: number = 0;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'NFT Trivia';
  }

  public createQuestionEmbed() {
    const questionData = nftTriviaData[Math.floor(Math.random() * nftTriviaData.length)];
    
    const optionsWithIndices = questionData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    this.correctIndex = shuffled.findIndex(opt => opt.originalIndex === questionData.correctIndex);

    const embed = new EmbedBuilder()
      .setTitle('🧠 NFT Trivia Time!')
      .setDescription(`**${questionData.question}**`)
      .setColor(Colors.Primary)
      .setFooter({ text: `Game ID: ${this.gameId} | You have 30 seconds!` });

    const row = new ActionRowBuilder<ButtonBuilder>();
    shuffled.forEach((opt, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`game_ans_${index}`)
          .setLabel(opt.text)
          .setStyle(ButtonStyle.Primary)
      );
    });

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered this question!' };
    this.markAnswered(userId);
    const answerIndex = parseInt(answer.replace('game_ans_', ''), 10);
    const isCorrect = answerIndex === this.correctIndex;
    if (isCorrect) {
      return { correct: true, message: `✅ Correct! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ Incorrect! Better luck next time.` };
    }
  }
}
