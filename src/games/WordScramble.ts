import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const WORDS = ['ETHEREUM','BITCOIN','SOLANA','POLYGON','METAMASK','OPENSEA','BLOCKCHAIN','DEFI','TOKEN','WALLET','MINING','STAKING','AIRDROP','BRIDGE','ORACLE','LEDGER','CONSENSUS','PROTOCOL','SNIPING','MINTING'];

export class WordScramble extends GameEngine {
    private originalWord: string = '';
    private options: string[] = [];

    getGameType() { return 'Word Scramble'; }

    createQuestionEmbed() {
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
            .setDescription(`Unscramble this crypto word:\n\n**${scrambled}**`);
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        options.forEach((opt, idx) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ans_${idx}`)
                    .setLabel(opt)
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        return { embeds: [embed], components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        const selected = this.options[parseInt(answer.replace('ans_', ''))];
        const correct = selected === this.originalWord;
        return { correct, message: correct ? 'Correct! You unscrambled the word.' : `Wrong! The word was ${this.originalWord}.` };
    }
}
