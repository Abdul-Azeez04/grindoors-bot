import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '../config/constants';

export function createMintBoard(mints: any[]) {
  const embed = new EmbedBuilder()
    .setTitle('💎 Mint Board')
    .setColor(Colors.PRIMARY);

  if (mints.length === 0) {
    embed.setDescription('No mints scheduled.');
  } else {
    const desc = mints.map(m => `**${m.projectName}** - ${m.chain} - <t:${Math.floor(m.mintTime.getTime() / 1000)}:R>`).join('\n');
    embed.setDescription(desc);
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('mint_add').setLabel('Add Mint').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('mint_today').setLabel('Today').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mint_tomorrow').setLabel('Tomorrow').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mint_all').setLabel('All Upcoming').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}
