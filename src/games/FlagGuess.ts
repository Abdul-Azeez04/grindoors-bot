import { GameEngine } from './GameEngine';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { flagsData } from './data/flags';
import { Colors } from '../config/constants';

export class FlagGuess extends GameEngine {
  private currentFlag: { emoji: string, country: string, region: string };
  private currentOptions: string[];
  
  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 25;
    
    // Setup game state
    const pool = flagsData.map(f => f.country);
    this.currentFlag = flagsData[Math.floor(Math.random() * flagsData.length)];
    
    const { options } = this.generateOptions(this.currentFlag.country, pool, 4);
    this.currentOptions = options;
  }
  
  getGameType(): string {
    return 'Flag Guess';
  }
  
  createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle('Guess the Flag!')
      .setDescription(`Which country does this flag belong to?\n\n# ${this.currentFlag.emoji}`)
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
      
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    this.currentOptions.forEach((option, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`game_ans_${index}`)
          .setLabel(option)
          .setStyle(ButtonStyle.Primary)
      );
    });
    
    return { embed, components: [row] };
  }
  
  handleAnswer(userId: string, answer: string): { correct: boolean, message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
    this.markAnswered(userId);

    const cleanAnswer = answer.replace(/^(game_ans_|game_answer_|ans_)/, '');
    const answerIndex = parseInt(cleanAnswer);
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= this.currentOptions.length) {
      return { correct: false, message: 'Invalid option.' };
    }
    
    const selectedCountry = this.currentOptions[answerIndex];
    const correct = selectedCountry === this.currentFlag.country;
    
    if (correct) {
      this.recordScore(userId, this.xpReward);
      return { correct: true, message: `✅ Correct! That is the flag of **${this.currentFlag.country}**! (+${this.xpReward} XP)` };
    }
    
    return { correct: false, message: `❌ Wrong! That was the flag of **${this.currentFlag.country}**.` };
  }
}
