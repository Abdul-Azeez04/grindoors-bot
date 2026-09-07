import { ChatInputCommandInteraction, ButtonInteraction, PermissionResolvable, PermissionsBitField, GuildMember } from 'discord.js';
import { env } from '../config/environment';

export function requirePermission(interaction: ChatInputCommandInteraction | ButtonInteraction, permission: PermissionResolvable): boolean {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) return false;
  return interaction.member.permissions.has(permission);
}

export function requireRole(interaction: ChatInputCommandInteraction | ButtonInteraction, roleId: string): boolean {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) return false;
  return interaction.member.roles.cache.has(roleId);
}

export function requireBotOwner(interaction: ChatInputCommandInteraction | ButtonInteraction): boolean {
  return interaction.user.id === env.BOT_OWNER_ID;
}

export function requireAdmin(interaction: ChatInputCommandInteraction | ButtonInteraction): boolean {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) return false;
  return interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild);
}
