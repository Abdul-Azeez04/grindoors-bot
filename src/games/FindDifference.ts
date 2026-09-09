import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

export class FindDifference extends GameEngine {
    private diffIndex: number = 0;

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 20;
    }

    getGameType() { return 'Find The Difference'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
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
            .setDescription(`Which row is slightly different?\n\n${rows}`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let i = 0; i < 4; i++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`game_ans_${i}`)
                    .setLabel(`Row ${i + 1}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }
        
        return { embed, components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
        this.markAnswered(userId);
        const selected = parseInt(answer.replace(/^(game_ans_|ans_)/, ''));
        const correct = selected === this.diffIndex;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! You found the difference in Row ${this.diffIndex + 1}! (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! The difference was in Row ${this.diffIndex + 1}.` };
    }
}
