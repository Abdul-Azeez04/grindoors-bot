import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createPaginatedEmbed(
  items: any[],
  itemsPerPage: number,
  currentPage: number,
  formatItem: (item: any, index: number) => string,
  title: string,
  color: number
): { embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder>, totalPages: number } {
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  
  const startIndex = (safePage - 1) * itemsPerPage;
  const pageItems = items.slice(startIndex, startIndex + itemsPerPage);
  
  const description = pageItems.map((item, i) => formatItem(item, startIndex + i)).join('\n') || 'No items to display.';
  
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: `Page ${safePage} of ${totalPages}` });
    
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('page_prev')
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage <= 1),
    new ButtonBuilder()
      .setCustomId('page_next')
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage >= totalPages)
  );
  
  return { embed, row, totalPages };
}
