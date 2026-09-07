import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class MemoryTest extends GameEngine {
    private targetEmoji: string = '';
    private options: string[] = [];

    getGameType() { return 'Memory Test'; }

    createQuestionEmbed() {
        const pool = ['🟦','🟨','🟥','🟩','🟪'];
        const sequence = this.shuffleArray([...pool]);
        const targetIndex = Math.floor(Math.random() * 5);
        this.targetEmoji = sequence[targetIndex];
        
        const embed = new EmbedBuilder()
            .setTitle('Memory Test')
            .setColor(Colors.PRIMARY)
            .setDescription(`Memorize this sequence:\n\n${sequence.join(' ')}\n\nWhat was item #${targetIndex + 1}?`);
            
        const { options } = this.generateOptions(this.targetEmoji, pool.filter(e => e !== this.targetEmoji), 4);
        this.options = options;
        
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
        const correct = selected === this.targetEmoji;
        return { correct, message: correct ? 'Correct! Great memory.' : `Wrong! It was ${this.targetEmoji}.` };
    }
}
