import { roleService } from '../../services/RoleService';
import { bot } from '../../index';

export default async function dailyRoleRotationHandler(data: { guildId: string }) {
  if (!bot?.client) return;
  const guild = await bot.client.guilds.fetch(data.guildId).catch(() => null);
  if (guild) {
    await roleService.rotateDailyRoles(guild);
  }
}
