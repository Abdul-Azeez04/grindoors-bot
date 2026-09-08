import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { songsData as puzzlesData } from './data/puzzlesData';

export class EmojiSong extends GameEngine {
    private puzzle: any;
    private options: string[] = [];

    getGameType() { return 'Emoji Song'; }

    createQuestionEmbed() {
        const songs = puzzlesData.filter((p: any) => p.type === 'song');
        this.puzzle = this.shuffleArray(songs)[0];
        
        const pool = songs.filter((s: any) => s.answer !== this.puzzle.answer).map((s: any) => s.answer);
        const { options } = this.generateOptions(this.puzzle.answer, pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Guess the Song')
            .setColor(Colors.PRIMARY)
            .setDescription(`What song do these emojis represent?\n\n**${this.puzzle.emojis}**\n*Artist: ${this.puzzle.artist || 'Unknown'}*`);
            
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
        return { correct, message: correct ? 'Correct! You guessed the song.' : `Wrong! It was ${this.puzzle.answer}.` };
    }
}
