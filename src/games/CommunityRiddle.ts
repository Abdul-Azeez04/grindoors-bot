import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { riddlesData as puzzlesData } from './data/puzzlesData';

export class CommunityRiddle extends GameEngine {
  private correctIndex: number = 0;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Community Riddle';
  }

  public createQuestionEmbed() {
    const riddles = puzzlesData.filter(p => p.type === 'riddle');
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    const options = riddle.options || [riddle.answer, 'Bitcoin', 'Ethereum', 'Satoshi'];
    const optionsWithIndices = options.map((opt, idx) => ({ text: opt, isCorrect: opt === riddle.answer }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    
    this.correctIndex = shuffled.findIndex(opt => opt.isCorrect);

    const embed = new EmbedBuilder()
      .setTitle('🤔 Community Riddle')
      .setDescription(`**Riddle:**\n${riddle.emojis}`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId}` });

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
      return { correct: true, message: `✅ Correct! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ Incorrect! Better luck next time.` };
    }
  }
}
