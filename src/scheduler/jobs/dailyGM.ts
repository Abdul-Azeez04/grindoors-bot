import { gmService } from '../../services/GMService';
import { Client } from 'discord.js';

// In a real setup, we might pass the client or retrieve it from a central registry.
// Assuming we have a global botClient or we fetch the guild another way.
import { client } from '../../index'; // assuming we export the bot client from index

export default async function dailyGMHandler(data: { guildId: string }) {
  if (!client) return;
  const guild = await client.guilds.fetch(data.guildId).catch(() => null);
  if (guild) {
    await gmService.postDailyGM(guild, data.guildId);
  }
}
