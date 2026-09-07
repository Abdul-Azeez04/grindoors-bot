import { mintService } from '../../services/MintService';
import prisma from '../../database/client';
import { client } from '../../index'; // assuming export from index
import { ChannelType } from 'discord.js';

export default async function mintAlertsHandler(data: { guildId: string }) {
  const mints = await mintService.getUpcomingMints(data.guildId);
  const now = new Date();

  for (const mint of mints) {
    // simplified logic: check if within 1 hour
    const diff = mint.mintTime.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours > 0 && hours <= 1 && !mint.alertSent1h) {
      const guild = await client.guilds.fetch(data.guildId).catch(() => null);
      if (guild) {
        const channels = await guild.channels.fetch();
        const alertChannel = channels.find(c => c?.name === 'mint-alerts' && c.type === ChannelType.GuildText);
        if (alertChannel && alertChannel.isTextBased()) {
          const embed = mintService.createMintEmbed(mint);
          await alertChannel.send({ embeds: [embed] });
          await prisma.mint.update({ where: { id: mint.id }, data: { alertSent1h: true } });
        }
      }
    }
  }
}
