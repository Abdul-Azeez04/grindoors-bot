import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your or another user\'s profile')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('The user to view')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;

  const targetUser = interaction.options.getUser('user') || interaction.user;

  const member = await prisma.member.findUnique({
    where: { discordId_guildId: { discordId: targetUser.id, guildId: interaction.guildId } }
  });

  if (!member) {
    // Auto-create profile if it doesn't exist
    const newMember = await prisma.member.create({
      data: {
        discordId: targetUser.id,
        guildId: interaction.guildId,
        username: targetUser.username,
        joinedAt: new Date(),
      }
    });
    
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${targetUser.username}'s Profile`)
      .setThumbnail(targetUser.displayAvatarURL())
      .setColor(Colors.PRIMARY)
      .addFields(
        { name: 'Status', value: '❌ Unverified', inline: true },
        { name: 'Level', value: '1', inline: true },
        { name: 'XP', value: '0', inline: true },
        { name: 'Games Played', value: '0', inline: true },
        { name: 'Games Won', value: '0', inline: true },
        { name: 'Daily Streak', value: '🔥 0', inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const isVerified = member.verificationStatus === 'VERIFIED';
  const winRate = member.totalGamesPlayed > 0 
    ? Math.round((member.totalGamesWon / member.totalGamesPlayed) * 100) 
    : 0;

  const embed = new EmbedBuilder()
    .setTitle(`👤 ${targetUser.username}'s Profile`)
    .setThumbnail(targetUser.displayAvatarURL())
    .setColor(Colors.PRIMARY)
    .addFields(
      { name: 'Status', value: isVerified ? '✅ Verified' : '❌ Unverified', inline: true },
      { name: 'Join Date', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: `${member.level}`, inline: true },
      { name: 'XP', value: `${member.xp}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Games Played', value: `${member.totalGamesPlayed}`, inline: true },
      { name: 'Games Won', value: `${member.totalGamesWon}`, inline: true },
      { name: 'Win Rate', value: `${winRate}%`, inline: true },
      { name: 'Daily Streak', value: `🔥 ${member.dailyStreak}`, inline: true },
      { name: 'Warnings', value: `${member.warningCount}`, inline: true }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
  return;
}
