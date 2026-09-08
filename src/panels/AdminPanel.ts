import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export function createAdminPanel() {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ ADMIN CONTROL CENTER')
    .setColor(Colors.PRIMARY)
    .setDescription('Select an administrative tool below to manage your server.');

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_members').setLabel('👥 Members').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('admin_verification').setLabel('🔐 Verification').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('admin_access_codes').setLabel('🔑 Access Codes').setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_roles').setLabel('🎭 Roles').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_server_struct').setLabel('🏗 Server Structure').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_cleanup').setLabel('🧹 Cleanup').setStyle(ButtonStyle.Danger)
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_mints').setLabel('💎 Mints').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('admin_gm').setLabel('☀️ GM Manager').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('admin_tickets').setLabel('🎫 Tickets').setStyle(ButtonStyle.Success)
  );

  const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_moderation').setLabel('🛡 Moderation').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_games').setLabel('🎮 Games').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_xp').setLabel('🏆 XP & Levels').setStyle(ButtonStyle.Secondary)
  );

  const row5 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('admin_analytics').setLabel('📊 Analytics').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_audit_logs').setLabel('📜 Audit Logs').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_settings').setLabel('⚙️ Settings').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3, row4, row5] };
}
