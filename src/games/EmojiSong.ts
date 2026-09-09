import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { songsData as puzzlesData } from './data/puzzlesData';

export class EmojiSong extends GameEngine {
    private puzzle: any;
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 25;
    }

    getGameType() { return 'Emoji Song'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        const songs = puzzlesData.filter((p: any) => p.type === 'song');
        this.puzzle = this.shuffleArray(songs)[0];
        
        const pool = songs.filter((s: any) => s.answer !== this.puzzle.answer).map((s: any) => s.answer);
        const { options } = this.generateOptions(this.puzzle.answer, pool, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Guess the Song')
            .setColor(Colors.PRIMARY)
            .setDescription(`What song do these emojis represent?\n\n**${this.puzzle.emojis}**\n*Artist: ${this.puzzle.artist || 'Unknown'}*`)
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
            return { correct: true, message: `✅ Correct! You guessed the song: **${this.puzzle.answer}** (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! It was **${this.puzzle.answer}**.` };
    }
}
