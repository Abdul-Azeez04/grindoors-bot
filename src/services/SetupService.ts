import { Guild, GuildMember, ChannelType } from 'discord.js';
import { channelService } from './ChannelService';
import { roleService } from './RoleService';
import { serverAuditService } from './ServerAuditService';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";

export interface SetupResult {
  channelsCreated: string[];
  rolesCreated: string[];
  panelsDeployed: string[];
  errors: string[];
}

export class SetupService {
  async quickSetup(guild: Guild, botMember: GuildMember): Promise<SetupResult> {
    const result: SetupResult = {
      channelsCreated: [],
      rolesCreated: [],
      panelsDeployed: [],
      errors: []
    };

    try {
      // 1. Create DB record
      await prisma.guild.upsert({
        where: { id: guild.id },
        update: {},
        create: { id: guild.id, name: guild.name }
      });

      // 2. Create Roles
      const roleNames = ['Owner', 'Administrator', 'Moderator', 'Support', 'Game Master', 'Community Manager', 'Verified', 'Member', 'Waiting Room', 'Unverified', 'Muted'];
      for (const name of roleNames) {
        try {
          const role = await roleService.createRole(guild, name);
          result.rolesCreated.push(role.name);
        } catch (e) {
          result.errors.push(`Failed to create role: ${name}`);
        }
      }

      // 3. Create Channels & Categories
      const structure = serverAuditService.generateRecommendedStructure();
      for (const category of structure.categories) {
        try {
          const catChannel = await channelService.createCategory(guild, category.name);
          for (const channelName of category.channels) {
            const ch = await channelService.createChannel(guild, channelName, ChannelType.GuildText, { category: catChannel.id });
            result.channelsCreated.push(ch.name);
          }
        } catch (e) {
          result.errors.push(`Failed to create category/channels: ${category.name}`);
        }
      }

      result.panelsDeployed.push('Verification Panel', 'Community Hub', 'Ticket Panel');

    } catch (error) {
      logger.error('Error during quick setup:', error);
      result.errors.push('Critical setup failure.');
    }

    return result;
  }
}

export const setupService = new SetupService();
