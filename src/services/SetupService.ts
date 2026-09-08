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

      const hubChannel = guild.channels.cache.find(c => c.name.includes('hub') || c.name.includes('welcome')) as any;
      if (hubChannel && hubChannel.isTextBased()) {
        const hubEmbed = new EmbedBuilder()
          .setTitle('🚀 GRINDOORS COMMUNITY HUB')
          .setColor(Colors.PRIMARY)
          .setDescription('Welcome to Grindoors! Use the buttons below to navigate the community.');
          
        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('hub_verify').setLabel('✅ Verify Account').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('hub_rules').setLabel('📜 Read Rules').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('hub_support').setLabel('🎫 Open Ticket').setStyle(ButtonStyle.Secondary)
        );
        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('hub_games').setLabel('🎮 Play Games').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('hub_leaderboard').setLabel('🏆 Leaderboard').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('hub_mints').setLabel('💎 NFTs/Mints').setStyle(ButtonStyle.Secondary)
        );

        await hubChannel.send({ embeds: [hubEmbed], components: [row1, row2] });
        result.panelsDeployed.push('Community Hub');
      }

      const ticketChannel = guild.channels.cache.find(c => c.name.includes('support') || c.name.includes('ticket')) as any;
      if (ticketChannel && ticketChannel.isTextBased()) {
        const ticketEmbed = new EmbedBuilder()
          .setTitle('🎫 SUPPORT TICKETS')
          .setColor(Colors.Dark) // Assuming this was fixed or exists, wait, let's use PRIMARY
          .setDescription('Need help? Click below to open a private ticket with the Game Masters.');
        ticketEmbed.setColor(Colors.PRIMARY);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('ticket_create').setLabel('Open Ticket').setStyle(ButtonStyle.Primary)
        );
        await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
        result.panelsDeployed.push('Ticket Panel');
      }

    } catch (error) {
      logger.error('Error during quick setup:', error);
      result.errors.push(`Critical Setup Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }
}

export const setupService = new SetupService();
