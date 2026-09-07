import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class GuessTheNumber extends GameEngine {
    private targetNumber: number = 0;
    private stage: number = 0;
    private activeUserId: string | null = null;
    
    getGameType() { return 'Guess The Number'; }

    createQuestionEmbed() {
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.stage = 1;
        
        const embed = new EmbedBuilder()
            .setTitle('Guess The Number')
            .setColor(Colors.PRIMARY)
            .setDescription('I have picked a number between 1 and 100. Select the correct range!');
            
        const row = this.buildRangeRow(1, 100, 4);
        return { embeds: [embed], components: [row] };
    }
    
    private buildRangeRow(min: number, max: number, count: number) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        const step = (max - min + 1) / count;
        for (let i = 0; i < count; i++) {
            const rMin = Math.floor(min + i * step);
            const rMax = Math.floor(min + (i + 1) * step - 1);
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ans_${rMin}_${rMax}`)
                    .setLabel(rMin === rMax ? `${rMin}` : `${rMin}-${rMax}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }
        return row;
    }

    override hasAnswered(userId: string): boolean {
        if (this.stage < 3) return false;
        return super.hasAnswered(userId);
    }

    handleAnswer(userId: string, answer: string) {
        if (!this.activeUserId) this.activeUserId = userId;
        if (this.activeUserId !== userId) return { correct: false, message: 'Someone else is playing this round!' };
        
        const parts = answer.split('_');
        const min = parseInt(parts[1]);
        const max = parseInt(parts[2]);
        
        if (this.targetNumber >= min && this.targetNumber <= max) {
            this.stage++;
            if (this.stage > 3 || min === max) {
                return { correct: true, message: `Correct! The number was ${this.targetNumber}.` };
            } else {
                const row = this.buildRangeRow(min, max, 4);
                if (this.message) {
                    this.message.edit({ components: [row] }).catch(() => {});
                }
                return { correct: true, message: `Good! Now narrow it down further.` };
            }
        } else {
            this.stage = 3;
            return { correct: false, message: `Wrong! The number was ${this.targetNumber}.` };
        }
    }
}
