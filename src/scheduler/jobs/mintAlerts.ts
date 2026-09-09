import { mintService } from '../../services/MintService';
import { prisma } from "../../database/client";
import { bot } from '../../index';
import { ChannelType, GuildTextBasedChannel } from 'discord.js';

export default async function mintAlertsHandler(data: { guildId: string }) {
  if (!bot?.client) return;
  const mints = await mintService.getUpcomingMints(data.guildId);
  const now = new Date();

  for (const mint of mints) {
    const diff = mint.mintTime.getTime() - now.getTime();
    const minutes = diff / (1000 * 60);
    
    // Check if within 1 hour alert window
    if (minutes > 0 && minutes <= 60 && !mint.alert1h) {
      const guild = await bot.client.guilds.fetch(data.guildId).catch(() => null);
      if (guild) {
        const channels = await guild.channels.fetch();
        const alertChannel = channels.find(c => c?.name === 'mint-alerts' && c.type === ChannelType.GuildText) as GuildTextBasedChannel | undefined;
        if (alertChannel && alertChannel.isTextBased()) {
          const embed = mintService.createMintEmbed(mint);
          await alertChannel.send({ content: '🔔 **UPCOMING MINT ALERT (1 Hour)!**', embeds: [embed] });
          await prisma.mint.update({ where: { id: mint.id }, data: { alert1h: true } });
        }
      }
    }
  }
}
