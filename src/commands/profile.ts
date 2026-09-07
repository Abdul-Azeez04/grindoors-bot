import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';
import { XPService } from '../services/XPService';
import { requireAdmin } from '../middleware/permissionGuard';

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
  const isSelf = targetUser.id === interaction.user.id;

  let isAdmin = false;
  try {
    await requireAdmin(interaction);
    isAdmin = true;
  } catch {
    isAdmin = false;
  }

  if (!isSelf && !isAdmin) {
    return interaction.reply({ content: 'You can only view your own profile.', ephemeral: true });
  }

  const member = await prisma.member.findUnique({
    where: { discordId_guildId: { discordId: targetUser.id, guildId: interaction.guildId } }
  });

  if (!member) {
    return interaction.reply({ content: 'Profile not found.', ephemeral: true });
  }

  const xpData = await XPService.getXP(interaction.guildId, targetUser.id);
  const winRate = member.totalGamesPlayed > 0 
    ? Math.round((member.totalGamesWon / member.totalGamesPlayed) * 100) 
    : 0;

  const embed = new EmbedBuilder()
    .setTitle(`👤 ${targetUser.username}'s Profile`)
    .setThumbnail(targetUser.displayAvatarURL())
    .setColor(Colors.PRIMARY)
    .addFields(
      { name: 'Status', value: member.isVerified ? '✅ Verified' : '❌ Unverified', inline: true },
      { name: 'Join Date', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: `${xpData.level}`, inline: true },
      { name: 'XP', value: `${xpData.xp}`, inline: true },
      { name: 'Rank', value: `#${xpData.rank}`, inline: true },
      { name: 'Games Played', value: `${member.totalGamesPlayed}`, inline: true },
      { name: 'Games Won', value: `${member.totalGamesWon}`, inline: true },
      { name: 'Win Rate', value: `${winRate}%`, inline: true },
      { name: 'Daily Streak', value: `🔥 ${member.dailyStreak}`, inline: true }
    );

  if (isAdmin || isSelf) {
    embed.addFields({ name: 'Warnings', value: `${member.warningsCount}`, inline: true });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
