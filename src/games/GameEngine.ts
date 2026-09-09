import { EmbedBuilder, ActionRowBuilder, TextChannel, Message } from 'discord.js';
import { XPService } from '../services/XPService';
import { logger } from '../utils/logger';
import { Colors } from '../config/constants';

export abstract class GameEngine {
  protected guildId: string;
  protected channelId: string;
  protected gameId: number | null = null;
  public status: 'WAITING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED' = 'WAITING';
  protected players: Map<string, { score: number, answered: boolean }> = new Map();
  protected timeoutMs: number = 30000; // 30s default
  protected xpReward: number = 25;
  protected message: Message | null = null;
  protected timeout: NodeJS.Timeout | null = null;
  
  constructor(guildId: string, channelId: string) {
    this.guildId = guildId;
    this.channelId = channelId;
  }
  
  abstract getGameType(): string;
  abstract createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] };
  abstract handleAnswer(userId: string, answer: string): { correct: boolean, message: string };
  
  async start(channel: TextChannel): Promise<void> {
    try {
      this.status = 'ACTIVE';
      const { embed, components } = this.createQuestionEmbed();
      this.message = await channel.send({ embeds: [embed], components });
      
      this.timeout = setTimeout(() => {
        if (this.status === 'ACTIVE') {
          this.end().catch(err => logger.error(`Error ending game: ${err}`));
        }
      }, this.timeoutMs);
    } catch (error) {
      logger.error(`Error starting game ${this.getGameType()}:`, error);
      this.status = 'CANCELLED';
    }
  }
  
  async end(): Promise<{ winners: { userId: string, score: number }[], embed: EmbedBuilder }> {
    this.status = 'FINISHED';
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    const winners = Array.from(this.players.entries())
      .filter(([_, data]) => data.score > 0)
      .map(([userId, data]) => ({ userId, score: data.score }));
      
    for (const winner of winners) {
      await XPService.awardXP(this.guildId, winner.userId, winner.score, 'GAME', `Won ${this.getGameType()}`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`${this.getGameType()} — Round Finished!`)
      .setColor(Colors.SUCCESS)
      .setDescription(
        winners.length > 0 
          ? `🏆 **Winners:**\n${winners.map(w => `<@${w.userId}>: +${w.score} XP`).join('\n')}`
          : '⌛ **Round Ended:** No correct answers were submitted.'
      );

    if (this.message) {
      try {
        await this.message.edit({ embeds: [embed], components: [] }); // Update in-place & disable buttons
      } catch (e) {
        // ignore
      }
    }
      
    return { winners, embed };
  }
  
  async addPlayer(userId: string): Promise<void> {
    if (!this.players.has(userId)) {
      this.players.set(userId, { score: 0, answered: false });
    }
  }
  
  hasPlayer(userId: string): boolean {
    return this.players.has(userId);
  }
  
  hasAnswered(userId: string): boolean {
    return this.players.get(userId)?.answered ?? false;
  }
  
  markAnswered(userId: string): void {
    const player = this.players.get(userId);
    if (player) {
      player.answered = true;
    }
  }

  public recordScore(userId: string, score: number): void {
    const player = this.players.get(userId);
    if (player) {
      player.score += score;
      player.answered = true;
    } else {
      this.players.set(userId, { score, answered: true });
    }
  }
  
  protected shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  protected generateOptions(correct: string, pool: string[], count: number = 4): { options: string[], correctIndex: number } {
    const options = new Set<string>();
    options.add(correct);
    
    // add random from pool until we have count
    const poolShuffled = this.shuffleArray(pool);
    let i = 0;
    while (options.size < count && i < poolShuffled.length) {
      options.add(poolShuffled[i]);
      i++;
    }
    
    const finalOptions = this.shuffleArray(Array.from(options));
    return {
      options: finalOptions,
      correctIndex: finalOptions.indexOf(correct)
    };
  }
}
