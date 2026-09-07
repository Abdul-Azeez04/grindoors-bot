import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show available commands and features');

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('Bot Help & Features')
    .setDescription('Here are the available features in this server:')
    .addFields(
      { name: '🔐 Verification', value: 'Verify to gain access to channels.' },
      { name: '🎮 Games', value: 'Play mini-games to earn XP.' },
      { name: '🏆 Leaderboards', value: 'Check top ranked users.' },
      { name: '🎫 Support', value: 'Open a ticket for help.' },
      { name: '👤 Profile', value: 'View your stats and level.' }
    )
    .setColor(Colors.PRIMARY);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('hub_profile').setLabel('My Profile').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub_leaderboard').setLabel('Leaderboard').setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}
