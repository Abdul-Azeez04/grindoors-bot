import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export function createCommunityHub() {
  const embed = new EmbedBuilder()
    .setTitle('🏠 COMMUNITY HUB')
    .setDescription('Welcome to the community! Use the buttons below to explore.')
    .setColor(Colors.PRIMARY);

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('hub_verify').setLabel('🔐 Verify').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('hub_support').setLabel('🎫 Support').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub_games').setLabel('🎮 Games').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('hub_leaderboard').setLabel('🏆 Leaderboard').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('hub_mints').setLabel('💎 Mints').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub_rules').setLabel('📜 Rules').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('hub_profile').setLabel('👤 Profile').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub_daily').setLabel('🔥 Daily Challenge').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('hub_stats').setLabel('📊 Stats').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}
