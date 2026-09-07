import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const PROFILES = [
    { answer: 'Satoshi Nakamoto', clues: ['I created Bitcoin.', 'My true identity is unknown.', 'I authored a famous whitepaper in 2008.'] },
    { answer: 'Vitalik Buterin', clues: ['I co-founded Ethereum.', 'I was born in Russia.', 'I dropped out of university in 2014.'] },
    { answer: 'Changpeng Zhao (CZ)', clues: ['I founded Binance.', 'I frequently tweet "4".', 'I stepped down as CEO in 2023.'] },
    { answer: 'Elon Musk', clues: ['I am the CEO of Tesla.', 'I frequently tweet about Dogecoin.', 'I acquired Twitter (now X).'] },
    { answer: 'Sam Bankman-Fried', clues: ['I founded FTX.', 'I was known for my curly hair.', 'I was convicted of fraud.'] }
];

export class WhoAmI extends GameEngine {
    private profile: any;
    private options: string[] = [];

    getGameType() { return 'Who Am I?'; }

    createQuestionEmbed() {
        this.profile = this.shuffleArray([...PROFILES])[0];
        
        const pool = PROFILES.filter(p => p.answer !== this.profile.answer).map(p => p.answer);
        const { options } = this.generateOptions(this.profile.answer, pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Who Am I?')
            .setColor(Colors.PRIMARY)
            .setDescription(`Read the clues and guess who I am:\n\n- ${this.profile.clues.join('\n- ')}`);
            
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
        const correct = selected === this.profile.answer;
        return { correct, message: correct ? 'Correct! You guessed it.' : `Wrong! It was ${this.profile.answer}.` };
    }
}
