import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const prompts = [
  { word: 'Rocket', options: ['🚀🌙', '🏠🌊', '🎸🎵', '🌲🏔'], correctIndex: 0 },
  { word: 'Diamond Hands', options: ['📄✋', '💎🙌', '🏃💨', '🔥🗑'], correctIndex: 1 },
  { word: 'Whale', options: ['🐟🎣', '🐕🪙', '🐋💰', '🐱💻'], correctIndex: 2 }
];

export class QuickDraw extends GameEngine {
  private correctIndex: number = 0;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 30;
  }

  public getGameType(): string {
    return 'Quick Draw';
  }

  public createQuestionEmbed() {
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    const optionsWithIndices = prompt.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    
    this.correctIndex = shuffled.findIndex(opt => opt.originalIndex === prompt.correctIndex);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Quick Draw (Emoji Match)')
      .setDescription(`Find the emoji combination that best matches:\n**${prompt.word}**`)
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
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
    this.markAnswered(userId);
    
    const answerIndex = parseInt(answer.replace('game_ans_', ''), 10);
    if (answerIndex === this.correctIndex) {
      return { correct: true, message: `✅ Correct! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ Incorrect! Better luck next time.` };
    }
  }
}
