import { gmService } from '../../services/GMService';
import { bot } from '../../index';

export default async function dailyGMHandler(data: { guildId: string }) {
  if (!bot?.client) return;
  const guild = await bot.client.guilds.fetch(data.guildId).catch(() => null);
  if (guild) {
    await gmService.postDailyGM(guild, data.guildId);
  }
}
