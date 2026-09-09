import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';
import { flagsData } from './data/flags';

export class FlagPuzzle extends GameEngine {
    private oddOneOut: any;
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 25;
    }

    getGameType() { return 'Flag Puzzle'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        const regions = [...new Set(flagsData.map(f => f.region))];
        const region1 = this.shuffleArray(regions)[0];
        const region2 = this.shuffleArray(regions.filter(r => r !== region1))[0];
        
        const r1Flags = this.shuffleArray(flagsData.filter(f => f.region === region1)).slice(0, 3);
        const r2Flags = this.shuffleArray(flagsData.filter(f => f.region === region2)).slice(0, 1);
        
        this.oddOneOut = r2Flags[0];
        
        const allFlags = this.shuffleArray([...r1Flags, ...r2Flags]);
        
        const { options } = this.generateOptions(
            this.oddOneOut.country,
            flagsData.map(f => f.country).filter(c => c !== this.oddOneOut.country),
            4
        );
        
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Odd One Out: Flags')
            .setColor(Colors.PRIMARY)
            .setDescription(`Three of these flags belong to the same region. Which one doesn't belong?\n\n${allFlags.map(f => f.emoji).join('   ')}`)
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
        const correct = selected === this.oddOneOut.country;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! You found the odd one out: **${this.oddOneOut.country}** (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! The odd one out was **${this.oddOneOut.country}**.` };
    }
}
