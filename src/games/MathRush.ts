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

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
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
            .setDescription(`Solve this quickly:\n\n**${expr} = ?**`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'} | 15s limit!` });
            
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
        const correct = selected === String(this.answer);
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! Quick maths! (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! The answer was **${this.answer}**.` };
    }
}
