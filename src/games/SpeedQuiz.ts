import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { nftTriviaData } from './data/nftTrivia';

export class SpeedQuiz extends GameEngine {
    private question: any;
    private startTime: number = 0;

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.timeoutMs = 15000;
        this.xpReward = 50;
    }

    getGameType() { return 'Speed Quiz'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        this.question = this.shuffleArray([...nftTriviaData])[0];
        this.startTime = Date.now();
        
        const embed = new EmbedBuilder()
            .setTitle('Speed Quiz!')
            .setColor(Colors.PRIMARY)
            .setDescription(`**${this.question.question}**\n\nAnswer quickly for more XP!`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'} | 15s limit!` });
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        this.question.options.forEach((opt: string, idx: number) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`game_ans_${idx}`)
                    .setLabel(opt.substring(0, 80))
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        return { embed, components: [row] };
    }

    handleAnswer(userId: string, answer: string) {
        if (this.hasAnswered(userId)) return { correct: false, message: 'You already answered!' };
        this.markAnswered(userId);
        const idx = parseInt(answer.replace(/^(game_ans_|ans_)/, ''));
        const correct = idx === this.question.correctIndex;
        if (correct) {
            const timeTaken = Date.now() - this.startTime;
            const bonus = Math.max(0, Math.floor((15000 - timeTaken) / 1000) * 2);
            const totalXP = this.xpReward + bonus;
            this.recordScore(userId, totalXP);
            return { correct: true, message: `✅ Correct! You answered in ${(timeTaken / 1000).toFixed(1)}s and earned **${totalXP} XP**!` };
        }
        return { correct: false, message: `❌ Wrong! The correct answer was: **${this.question.options[this.question.correctIndex]}**` };
    }
}
