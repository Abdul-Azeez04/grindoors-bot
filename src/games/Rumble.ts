import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class Rumble extends GameEngine {
  private joinedPlayers = new Set<string>();

  constructor(guildId: string, channelId: string) {
    super(guildId, channelId);
    this.xpReward = 100;
  }

  public getGameType(): string {
    return 'Rumble';
  }

  public createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle('⚔️ Rumble! Multiplayer Elimination')
      .setDescription('Join the rumble! May the best player win. Lobby closes in 30 seconds.')
      .setColor(Colors.PRIMARY)
      .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_join_rumble').setLabel('JOIN RUMBLE').setStyle(ButtonStyle.Success)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (answer === 'game_join_rumble' || answer === 'rumble') {
      if (this.joinedPlayers.has(userId)) {
        return { correct: false, message: 'You already joined the Rumble!' };
      }
      this.joinedPlayers.add(userId);
      this.addPlayer(userId);
      return { correct: true, message: '✅ You joined the Rumble!' };
    }
    return { correct: false, message: 'Invalid action.' };
  }

  async end(): Promise<{ winners: { userId: string, score: number }[], embed: EmbedBuilder }> {
    if (this.joinedPlayers.size > 0) {
      const playersList = Array.from(this.joinedPlayers);
      const winnerId = playersList[Math.floor(Math.random() * playersList.length)];
      this.recordScore(winnerId, this.xpReward);
    }
    return super.end();
  }
}
