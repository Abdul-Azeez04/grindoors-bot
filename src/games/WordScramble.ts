import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const WORDS = ['ETHEREUM','BITCOIN','SOLANA','POLYGON','METAMASK','OPENSEA','BLOCKCHAIN','DEFI','TOKEN','WALLET','MINING','STAKING','AIRDROP','BRIDGE','ORACLE','LEDGER','CONSENSUS','PROTOCOL','SNIPING','MINTING'];

export class WordScramble extends GameEngine {
    private originalWord: string = '';
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 25;
    }

    getGameType() { return 'Word Scramble'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        this.originalWord = this.shuffleArray([...WORDS])[0];
        const scrambled = this.shuffleArray(this.originalWord.split('')).join('');
        
        const { options } = this.generateOptions(
            this.originalWord,
            WORDS.filter(w => w !== this.originalWord),
            4
        );
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Word Scramble')
            .setColor(Colors.PRIMARY)
            .setDescription(`Unscramble this crypto word:\n\n**${scrambled}**`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        options.forEach((opt, idx) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`game_ans_${idx}`)
                    .setLabel(opt)
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        return { embed, components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
        this.markAnswered(userId);
        const idx = parseInt(answer.replace(/^(game_ans_|ans_)/, ''));
        const selected = this.options[idx];
        const correct = selected === this.originalWord;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! You unscrambled **${this.originalWord}** (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! The word was **${this.originalWord}**.` };
    }
}
