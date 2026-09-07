import { Guild, Role, GuildMember, ColorResolvable } from 'discord.js';
import logger from '../utils/logger';
import prisma from '../database/client';

export class RoleService {
  async createRole(guild: Guild, name: string, options?: { color?: ColorResolvable, permissions?: bigint, hoist?: boolean, mentionable?: boolean }): Promise<Role> {
    try {
      const role = await guild.roles.create({
        name,
        color: options?.color,
        permissions: options?.permissions,
        hoist: options?.hoist,
        mentionable: options?.mentionable,
      });
      logger.info(`Created role ${name} in guild ${guild.id}`);
      return role;
    } catch (error) {
      logger.error(`Error creating role ${name}:`, error);
      throw error;
    }
  }

  async deleteRole(role: Role): Promise<void> {
    try {
      await role.delete();
      logger.info(`Deleted role ${role.name} in guild ${role.guild.id}`);
    } catch (error) {
      logger.error(`Error deleting role ${role.name}:`, error);
      throw error;
    }
  }

  async renameRole(role: Role, newName: string): Promise<void> {
    try {
      await role.setName(newName);
      logger.info(`Renamed role to ${newName} in guild ${role.guild.id}`);
    } catch (error) {
      logger.error(`Error renaming role ${role.name}:`, error);
      throw error;
    }
  }

  async assignRole(member: GuildMember, role: Role): Promise<void> {
    try {
      await member.roles.add(role);
      logger.info(`Assigned role ${role.name} to member ${member.user.tag}`);
    } catch (error) {
      logger.error(`Error assigning role ${role.name} to ${member.user.tag}:`, error);
      throw error;
    }
  }

  async removeRole(member: GuildMember, role: Role): Promise<void> {
    try {
      await member.roles.remove(role);
      logger.info(`Removed role ${role.name} from member ${member.user.tag}`);
    } catch (error) {
      logger.error(`Error removing role ${role.name} from ${member.user.tag}:`, error);
      throw error;
    }
  }

  async getRoleStats(guild: Guild): Promise<{ total: number, withMembers: number, empty: number, hierarchy: number }> {
    const roles = await guild.roles.fetch();
    let total = 0, withMembers = 0, empty = 0;
    
    for (const [id, role] of roles) {
      total++;
      if (role.members.size > 0) withMembers++;
      else empty++;
    }
    
    return {
      total,
      withMembers,
      empty,
      hierarchy: guild.roles.highest.position,
    };
  }

  async getDailyRoles(guildId: string): Promise<any[]> {
    return prisma.roleConfig.findMany({
      where: { guildId, isDaily: true }
    });
  }

  async rotateDailyRoles(guild: Guild): Promise<void> {
    try {
      // Logic for daily roles would go here, involving getting members with yesterday's role
      // and assigning today's role, but kept basic for this stage.
      logger.info(`Rotated daily roles for guild ${guild.id}`);
    } catch (error) {
      logger.error(`Error rotating daily roles in guild ${guild.id}:`, error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
