import { Guild, GuildMember, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { channelService } from './ChannelService';
import { roleService } from './RoleService';
import { serverAuditService } from './ServerAuditService';
import { prisma } from "../database/client";
import { logger } from "../utils/logger";
import { Colors } from '../config/constants';

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
          // Skip if role already exists
          const existing = guild.roles.cache.find(r => r.name === name);
          if (existing) {
            result.rolesCreated.push(`${name} (exists)`);
            continue;
          }
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
          // Skip if category already exists
          const existingCat = guild.channels.cache.find(c => c.name.toUpperCase() === category.name.toUpperCase() && c.type === ChannelType.GuildCategory);
          if (existingCat) {
            result.channelsCreated.push(`${category.name} (exists)`);
            continue;
          }
          const catChannel = await channelService.createCategory(guild, category.name);
          
          // Basic permission setup:
          const { PermissionsBitField } = await import('discord.js');
          const unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');
          
          if (unverifiedRole) {
            if (category.name === 'VERIFICATION') {
              // VERIFICATION category: Visible to Unverified, hidden from everyone else
              await catChannel.permissionOverwrites.set([
                {
                  id: guild.roles.everyone.id,
                  deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                  id: unverifiedRole.id,
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                  deny: [PermissionsBitField.Flags.SendMessages],
                }
              ]);
            } else {
              // ALL OTHER categories: Hidden from Unverified role, explicitly visible to Member role
              await catChannel.permissionOverwrites.edit(unverifiedRole.id, {
                ViewChannel: false
              });
              
              const memberRole = guild.roles.cache.find(r => r.name === 'Member');
              if (memberRole) {
                await catChannel.permissionOverwrites.edit(memberRole.id, {
                  ViewChannel: true,
                  SendMessages: true,
                  ReadMessageHistory: true
                });
              }
            }
          }

          for (const channelName of category.channels) {
            const ch = await channelService.createChannel(guild, channelName, ChannelType.GuildText, { category: catChannel.id });
            result.channelsCreated.push(ch.name);
          }
        } catch (e) {
          result.errors.push(`Failed to create category/channels: ${category.name}`);
        }
      }

      // Refresh the channel cache after creating channels
      await guild.channels.fetch();

      // 4. Deploy Community Hub panel
      const hubChannel = guild.channels.cache.find(c => c.name.includes('welcome') || c.name.includes('general')) as any;
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

      // 5. Deploy Ticket panel
      const ticketChannel = guild.channels.cache.find(c => c.name.includes('support') || c.name.includes('ticket')) as any;
      if (ticketChannel && ticketChannel.isTextBased()) {
        const ticketEmbed = new EmbedBuilder()
          .setTitle('🎫 SUPPORT TICKETS')
          .setColor(Colors.PRIMARY)
          .setDescription('Need help? Click below to open a private ticket with the Game Masters.');
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('ticket_create').setLabel('Open Ticket').setStyle(ButtonStyle.Primary)
        );
        await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
        result.panelsDeployed.push('Ticket Panel');
      }

      // 6. Deploy Verification panel
      const verifyChannel = guild.channels.cache.find(c => c.name === 'verify') as any;
      if (verifyChannel && verifyChannel.isTextBased()) {
        const { createVerificationPanel } = await import('../panels/VerificationPanel');
        const verifyPanelData = createVerificationPanel();
        await verifyChannel.send(verifyPanelData);
        result.panelsDeployed.push('Verification Panel');
      }

      // 7. Deploy Game Lobby panel
      const gameChannel = guild.channels.cache.find(c => c.name === 'game-lobby') as any;
      if (gameChannel && gameChannel.isTextBased()) {
        const { createGameLobby } = await import('../panels/GameLobby');
        const gameLobbyData = createGameLobby();
        await gameChannel.send(gameLobbyData);
        result.panelsDeployed.push('Game Lobby');
      }

      // 8. Deploy Leaderboard panel
      const lbChannel = guild.channels.cache.find(c => c.name === 'leaderboards') as any;
      if (lbChannel && lbChannel.isTextBased()) {
        const { createLeaderboardPanel } = await import('../panels/LeaderboardPanel');
        const lbData = await createLeaderboardPanel(guild.id);
        await lbChannel.send(lbData);
        result.panelsDeployed.push('Leaderboard Panel');
      }

      // 9. Deploy Mint Board panel
      const mintChannel = guild.channels.cache.find(c => c.name === 'mint-alerts') as any;
      if (mintChannel && mintChannel.isTextBased()) {
        const { createMintBoard } = await import('../panels/MintBoard');
        const mintData = createMintBoard([]);
        await mintChannel.send(mintData);
        result.panelsDeployed.push('Mint Board');
      }

    } catch (error) {
      logger.error('Error during quick setup:', error);
      result.errors.push(`Critical Setup Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }
}

export const setupService = new SetupService();
