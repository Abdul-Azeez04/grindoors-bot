import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const NFT_TERMS = ['ETHEREUM','OPENSEA','METAMASK','BLOCKCHAIN','CRYPTOPUNKS','BORED APE','AZUKI','PUDGY','SOLANA','POLYGON','AIRDROP','WHITELIST','ALLOWLIST','DIAMOND HANDS','FLOOR PRICE','GAS FEE','SMART CONTRACT','DECENTRALIZED','WEB THREE','MINTING'];

export class UnscrambleNFT extends GameEngine {
  private correctTerm: string = '';
  private correctIndex: number = 0;

  constructor(guildId: string) {
    super(guildId);
    this.xpReward = 25;
  }

  public getGameType(): string {
    return 'Unscramble NFT';
  }

  private scrambleWord(word: string): string {
    const chars = word.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  public createQuestionEmbed() {
    const pool = this.shuffleArray(NFT_TERMS).slice(0, 4);
    this.correctTerm = pool[0];
    const scrambled = this.scrambleWord(this.correctTerm);
    
    const optionsWithIndices = pool.map(opt => ({ text: opt, isCorrect: opt === this.correctTerm }));
    const shuffled = this.shuffleArray(optionsWithIndices);
    
    this.correctIndex = shuffled.findIndex(opt => opt.isCorrect);

    const embed = new EmbedBuilder()
      .setTitle('🔠 Unscramble NFT Term')
      .setDescription(`Unscramble this word:\n**${scrambled}**`)
      .setColor(Colors.Primary)
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
      return { correct: true, message: `✅ Correct! It was ${this.correctTerm}. You earned ${this.xpReward} XP!` };
    } else {
      return { correct: false, message: `❌ Incorrect! The correct term was ${this.correctTerm}.` };
    }
  }
}
