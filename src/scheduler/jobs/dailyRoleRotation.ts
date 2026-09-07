import { roleService } from '../../services/RoleService';
import { client } from '../../index'; 

export default async function dailyRoleRotationHandler(data: { guildId: string }) {
  if (!client) return;
  const guild = await client.guilds.fetch(data.guildId).catch(() => null);
  if (guild) {
    await roleService.rotateDailyRoles(guild);
  }
}
