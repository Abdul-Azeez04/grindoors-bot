import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const truthsAndLies = [
  { statements: ['Bitcoin was created in 2009.', 'Ethereum introduced smart contracts.', 'Dogecoin has a hard supply cap.'], lieIndex: 2 },
  { statements: ['Satoshi Nakamoto is a known public figure.', 'NFT stands for Non-Fungible Token.', 'Binance is a cryptocurrency exchange.'], lieIndex: 0 },
  { statements: ['Solana uses Proof of History.', 'Polygon is a Layer 1 blockchain.', 'Airdrops distribute free tokens.'], lieIndex: 1 }
];

export class TwoTruthsOneLie extends GameEngine {
  private lieIndex: number = 0;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Two Truths One Lie';
  }

  public createQuestionEmbed() {
    const data = truthsAndLies[Math.floor(Math.random() * truthsAndLies.length)];
    
    const statementsWithIndices = data.statements.map((stmt, idx) => ({ text: stmt, originalIndex: idx }));
    const shuffled = this.shuffleArray(statementsWithIndices);
    
    this.lieIndex = shuffled.findIndex(stmt => stmt.originalIndex === data.lieIndex);

    const embed = new EmbedBuilder()
      .setTitle('🤥 Two Truths and One Lie')
      .setDescription(`Find the lie among these three statements!`)
      .setColor(Colors.WARNING)
      .setFooter({ text: `Game ID: ${this.gameId}` });

    const row = new ActionRowBuilder<ButtonBuilder>();
    shuffled.forEach((stmt, index) => {
      row.addComponents(
        new ButtonBuilder().setCustomId(`game_ans_${index}`).setLabel(`Statement ${index + 1}`).setStyle(ButtonStyle.Primary)
      );
      embed.addFields({ name: `Statement ${index + 1}`, value: stmt.text });
    });

    return { embed, components: [row] };
  }

  public handleAnswer(userId: string, answer: string): { correct: boolean; message: string } {
    if (this.hasAnswered(userId)) return { correct: false, message: 'You already guessed!' };
    this.markAnswered(userId);
    
    const answerIndex = parseInt(answer.replace('game_ans_', ''), 10);
    if (answerIndex === this.lieIndex) {
      return { correct: true, message: `✅ You found the lie! You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ That was a truth! Better luck next time.` };
    }
  }
}
