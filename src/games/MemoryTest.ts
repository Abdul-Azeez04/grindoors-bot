import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class MemoryTest extends GameEngine {
    private targetEmoji: string = '';
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 25;
    }

    getGameType() { return 'Memory Test'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        const pool = ['🟦','🟨','🟥','🟩','🟪'];
        const sequence = this.shuffleArray([...pool]);
        const targetIndex = Math.floor(Math.random() * 5);
        this.targetEmoji = sequence[targetIndex];
        
        const embed = new EmbedBuilder()
            .setTitle('Memory Test')
            .setColor(Colors.PRIMARY)
            .setDescription(`Memorize this sequence:\n\n${sequence.join(' ')}\n\nWhat was item #${targetIndex + 1}?`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
            
        const { options } = this.generateOptions(this.targetEmoji, pool.filter(e => e !== this.targetEmoji), 4);
        this.options = options;
        
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
        const correct = selected === this.targetEmoji;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! Great memory. (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! It was ${this.targetEmoji}.` };
    }
}
