import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { GameEngine } from './GameEngine';
import { Colors } from '../config/constants';

const WORDS = ['APPLE','EAGLE','ELEPHANT','TIGER','RABBIT','TRAIN','NIGHT','TABLE','ENERGY','YELLOW','WATER','ROCK','KITE','EARTH','HEART'];

export class WordChain extends GameEngine {
    private targetWord: string = '';
    private options: string[] = [];

    constructor(guildId: string, channelId: string) {
        super(guildId, channelId);
        this.xpReward = 20;
    }

    getGameType() { return 'Word Chain'; }

    createQuestionEmbed(): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
        const startWord = this.shuffleArray([...WORDS])[0];
        const lastLetter = startWord.slice(-1);
        
        const validWords = WORDS.filter(w => w.startsWith(lastLetter) && w !== startWord);
        this.targetWord = validWords.length > 0 ? this.shuffleArray(validWords)[0] : 'ECHO';
        
        const invalidWords = WORDS.filter(w => !w.startsWith(lastLetter) && w !== startWord);
        
        const { options } = this.generateOptions(this.targetWord, invalidWords, 4);
        this.options = options;
        
        const embed = new EmbedBuilder()
            .setTitle('Word Chain')
            .setColor(Colors.PRIMARY)
            .setDescription(`The starting word is **${startWord}**.\nWhich word logically follows in a word chain?`)
            .setFooter({ text: `Game ID: ${this.gameId || 'Active'}` });
            
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
        const correct = selected === this.targetWord;
        if (correct) {
            this.recordScore(userId, this.xpReward);
            return { correct: true, message: `✅ Correct! The chain continues with **${this.targetWord}** (+${this.xpReward} XP)` };
        }
        return { correct: false, message: `❌ Wrong! The correct word was **${this.targetWord}**.` };
    }
}
