import { ChatInputCommandInteraction, ButtonInteraction, PermissionResolvable, PermissionsBitField, GuildMember } from 'discord.js';
import { env } from '../config/environment';

export function requirePermission(interaction: ChatInputCommandInteraction | ButtonInteraction, permission: PermissionResolvable): boolean {
  if (interaction.memberPermissions) {
    return interaction.memberPermissions.has(permission);
  }
  const member = interaction.member as any;
  if (!member) return false;
  return member.permissions ? member.permissions.has(permission) : false;
}

export function requireRole(interaction: ChatInputCommandInteraction | ButtonInteraction, roleId: string): boolean {
  const member = interaction.member as any;
  if (!member) return false;
  if (Array.isArray(member.roles)) {
    return member.roles.includes(roleId);
  }
  return member.roles?.cache?.has(roleId) ?? false;
}

export function requireBotOwner(interaction: ChatInputCommandInteraction | ButtonInteraction): boolean {
  return Boolean(env.BOT_OWNER_ID && interaction.user.id === env.BOT_OWNER_ID);
}

export function requireAdmin(interaction: ChatInputCommandInteraction | ButtonInteraction): boolean {
  // 1. Global Bot Owner bypass
  if (env.BOT_OWNER_ID && interaction.user.id === env.BOT_OWNER_ID) {
    return true;
  }

  // 2. Server Owner has full authority on their own server
  if (interaction.guild && interaction.guild.ownerId === interaction.user.id) {
    return true;
  }

  // 3. Discord native Administrator or ManageGuild permissions
  if (interaction.memberPermissions) {
    if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
        interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return true;
    }
  }

  const member = interaction.member as any;
  if (member?.permissions) {
    if (member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return true;
    }
  }

  // 4. Role-based fallback: check if user holds an Admin/Mod/Owner role by name
  if (interaction.guild && member) {
    const adminRoleNames = ['Administrator', 'Admin', 'Owner', 'Moderator', 'Mod'];
    if (Array.isArray(member.roles)) {
      const hasRole = interaction.guild.roles.cache.some(
        r => member.roles.includes(r.id) && adminRoleNames.includes(r.name)
      );
      if (hasRole) return true;
    } else if (member.roles?.cache) {
      const hasRole = member.roles.cache.some((r: any) => adminRoleNames.includes(r.name));
      if (hasRole) return true;
    }
  }

  return false;
}
