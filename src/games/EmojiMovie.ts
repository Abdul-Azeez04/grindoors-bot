import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { moviesData as puzzlesData } from './data/puzzlesData';

export class EmojiMovie extends GameEngine {
    private puzzle: any;
    private options: string[] = [];

    getGameType() { return 'Emoji Movie'; }

    createQuestionEmbed() {
        const movies = puzzlesData.filter((p: any) => p.type === 'movie');
        this.puzzle = this.shuffleArray(movies)[0];
        
        const pool = movies.filter((m: any) => m.answer !== this.puzzle.answer).map((m: any) => m.answer);
        const { options } = this.generateOptions(this.puzzle.answer, pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Guess the Movie')
            .setColor(Colors.PRIMARY)
            .setDescription(`What movie do these emojis represent?\n\n**${this.puzzle.emojis}**`);
            
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
        const correct = selected === this.puzzle.answer;
        return { correct, message: correct ? 'Correct! You guessed the movie.' : `Wrong! It was ${this.puzzle.answer}.` };
    }
}
