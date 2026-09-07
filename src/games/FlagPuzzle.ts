import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import flagsData from './data/flags';

export class FlagPuzzle extends GameEngine {
    private oddOneOut: any;
    private options: string[] = [];

    getGameType() { return 'Flag Puzzle'; }

    createQuestionEmbed() {
        const regions = [...new Set(flagsData.map(f => f.region))];
        const region1 = this.shuffleArray(regions)[0];
        const region2 = this.shuffleArray(regions.filter(r => r !== region1))[0];
        
        const r1Flags = this.shuffleArray(flagsData.filter(f => f.region === region1)).slice(0, 3);
        const r2Flags = this.shuffleArray(flagsData.filter(f => f.region === region2)).slice(0, 1);
        
        this.oddOneOut = r2Flags[0];
        
        const allFlags = this.shuffleArray([...r1Flags, ...r2Flags]);
        
        const { options } = this.generateOptions(
            this.oddOneOut.country,
            flagsData.map(f => f.country).filter(c => c !== this.oddOneOut.country),
            4
        );
        
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Odd One Out: Flags')
            .setColor(Colors.PRIMARY)
            .setDescription(`Three of these flags belong to the same region. Which one doesn't belong?\n\n${allFlags.map(f => f.emoji).join('   ')}`);
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        options.forEach((opt, idx) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ans_${idx}`)
                    .setLabel(opt.substring(0, 80))
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        return { embeds: [embed], components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        const selected = this.options[parseInt(answer.replace('ans_', ''))];
        const correct = selected === this.oddOneOut.country;
        return { correct, message: correct ? 'Correct! You found the odd one out.' : `Wrong! The odd one out was ${this.oddOneOut.country}.` };
    }
}
