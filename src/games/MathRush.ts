import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class MathRush extends GameEngine {
    private answer: number = 0;
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.timeoutMs = 15000;
        this.xpReward = 30;
    }

    getGameType() { return 'Math Rush'; }

    createQuestionEmbed() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;
        
        const isMultiplyFirst = Math.random() > 0.5;
        let expr = '';
        if (isMultiplyFirst) {
            this.answer = a * b + c;
            expr = `${a} × ${b} + ${c}`;
        } else {
            this.answer = a + b * c;
            expr = `${a} + ${b} × ${c}`;
        }
        
        const pool = [
            this.answer + 1,
            this.answer - 1,
            this.answer + 2,
            this.answer - 2,
            this.answer + 10,
            this.answer - 10
        ].map(String);
        
        const { options } = this.generateOptions(String(this.answer), pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Math Rush!')
            .setColor(Colors.PRIMARY)
            .setDescription(`Solve this quickly:\n\n**${expr} = ?**`);
            
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
        const correct = selected === String(this.answer);
        return { correct, message: correct ? 'Correct! Quick maths.' : `Wrong! The answer was ${this.answer}.` };
    }
}
