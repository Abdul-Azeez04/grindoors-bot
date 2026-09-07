import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class Rumble extends GameEngine {
  private joinedPlayers = new Set<string>();

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 100;
  }

  public getGameType(): string {
    return 'Rumble';
  }

  public createQuestionEmbed() {
    const embed = new EmbedBuilder()
      .setTitle('⚔️ Rumble! Multiplayer Elimination')
      .setDescription('Join the rumble! May the best player win. Lobby closes in 30 seconds.')
      .setColor(Colors.Primary)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('game_join_rumble').setLabel('JOIN RUMBLE').setStyle(ButtonStyle.Success)
      );

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (answer === 'game_join_rumble') {
      if (this.joinedPlayers.has(userId)) {
        return { correct: false, message: 'You already joined the Rumble!' };
      }
      this.joinedPlayers.add(userId);
      this.addPlayer(userId);
      return { correct: true, message: '✅ You joined the Rumble!' };
    }
    return { correct: false, message: 'Invalid action.' };
  }
}
