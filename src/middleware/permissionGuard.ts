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
  if (interaction.memberPermissions) {
    return interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
           interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild);
  }
  const member = interaction.member as any;
  if (!member?.permissions) return false;
  return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
         member.permissions.has(PermissionsBitField.Flags.ManageGuild);
}
