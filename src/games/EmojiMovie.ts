import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { moviesData as puzzlesData } from './data/puzzlesData';

export class EmojiMovie extends GameEngine {
    private puzzle: any;
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 25;
    }

    getGameType() { return 'Emoji Movie'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        const movies = puzzlesData.filter((p: any) => p.type === 'movie');
        this.puzzle = this.shuffleArray(movies)[0];
        
        const pool = movies.filter((m: any) => m.answer !== this.puzzle.answer).map((m: any) => m.answer);
        const { options } = this.generateOptions(this.puzzle.answer, pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Guess the Movie')
            .setColor(Colors.PRIMARY)
            .setDescription(`What movie do these emojis represent?\n\n**${this.puzzle.emojis}**`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
            
        const row = new ActionRowBuilder<ButtonBuilder>();
        options.forEach((opt, idx) => {
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
        const selected = this.options[idx];
        const correct = selected === this.puzzle.answer;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! You guessed the movie: **${this.puzzle.answer}** (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! It was **${this.puzzle.answer}**.` };
    }
}
