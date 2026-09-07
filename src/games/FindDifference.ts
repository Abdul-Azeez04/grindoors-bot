import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class FindDifference extends GameEngine {
    private diffIndex: number = 0;

    getGameType() { return 'Find The Difference'; }

    createQuestionEmbed() {
        const pairs = [
            ['😀','😃'], ['🍎','🍅'], ['🚗','🚙'], ['☀️','🌤️'], ['🐶','🐱']
        ];
        const pair = this.shuffleArray(pairs)[0];
        const base = pair[0];
        const diff = pair[1];
        
        this.diffIndex = Math.floor(Math.random() * 4);
        let rows = '';
        
        for (let i = 0; i < 4; i++) {
            if (i === this.diffIndex) {
                let rowChars = Array(5).fill(base);
                rowChars[Math.floor(Math.random() * 5)] = diff;
                rows += `${i + 1}. ` + rowChars.join('') + '\n';
            } else {
                rows += `${i + 1}. ` + Array(5).fill(base).join('') + '\n';
            }
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Find The Difference')
            .setColor(Colors.PRIMARY)
            .setDescription(`Which row is slightly different?\n\n${rows}`);
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let i = 0; i < 4; i++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ans_${i}`)
                    .setLabel(`Row ${i + 1}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }
        
        return { embeds: [embed], components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        const selected = parseInt(answer.replace('ans_', ''));
        const correct = selected === this.diffIndex;
        return { correct, message: correct ? 'Correct! You found the difference.' : `Wrong! The difference was in Row ${this.diffIndex + 1}.` };
    }
}
