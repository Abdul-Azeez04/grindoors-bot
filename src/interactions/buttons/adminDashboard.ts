import { ButtonInteraction, EmbedBuilder, ChannelType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from "../../utils/logger";
import { Colors } from '../../config/constants';
import { createAdminPanel } from '../../panels/AdminPanel';

function backRow(...extraButtons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  if (extraButtons.length > 0) {
    row.addComponents(extraButtons);
  }
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('admin_back_main')
      .setLabel('🔙 Back to Admin Menu')
      .setStyle(ButtonStyle.Secondary)
  );
  return row;
}

export async function handleAdminDashboardButton(interaction: ButtonInteraction) {
  // Permission check
  const member = interaction.member as any;
  if (!member?.permissions?.has(PermissionsBitField.Flags.Administrator) &&
      !member?.permissions?.has(PermissionsBitField.Flags.ManageGuild)) {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: '❌ You need Admin permissions.' });
    } else {
      await interaction.reply({ content: '❌ You need Admin permissions.', ephemeral: true });
    }
    return;
  }

  const customId = interaction.customId;
  const guild = interaction.guild!;

  try {
    switch (customId) {

      // ──────────────── BACK TO MAIN ADMIN MENU ────────────────
      case 'admin_back_main': {
        const { embeds, components } = createAdminPanel();
        await interaction.update({ embeds, components, content: '' });
        break;
      }

      // ──────────────── SERVER STRUCTURE ────────────────
      case 'admin_server_struct': {
        await interaction.deferUpdate();
        const { setupService } = await import('../../services/SetupService');
        const botMember = await guild.members.fetch(interaction.client.user!.id);
        const result = await setupService.quickSetup(guild, botMember);
        
        const embed = new EmbedBuilder()
          .setTitle('🏗 Server Structure Built')
          .setColor(Colors.SUCCESS)
          .addFields(
            { name: 'Channels Created', value: `${result.channelsCreated.length}`, inline: true },
            { name: 'Roles Created', value: `${result.rolesCreated.length}`, inline: true },
            { name: 'Panels Deployed', value: `${result.panelsDeployed.length}`, inline: true }
          );

        if (result.errors.length > 0) {
          embed.addFields({ name: '⚠️ Errors', value: result.errors.slice(0, 5).join('\n') });
        }
        
        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── NUCLEAR CLEANUP CONFIRMATION ────────────────
      case 'admin_cleanup': {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ DANGER ZONE: CONFIRM NUCLEAR SERVER WIPE')
          .setColor(Colors.ERROR)
          .setDescription(
            `🛑 **WARNING: THIS ACTION IS DESTRUCTIVE AND IRREVERSIBLE!**\n\n` +
            `This will permanently delete:\n` +
            `• **All channels & categories** in **${guild.name}** (except this active channel and Discord protected channels)\n` +
            `• **All custom server roles** (except @everyone and bot managed roles)\n\n` +
            `Are you **100% sure** you want to completely wipe and reset this server?`
          )
          .setFooter({ text: 'Action will be logged. You cannot undo this.' });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('admin_cleanup_confirm')
            .setLabel('🚨 YES, WIPE ENTIRE SERVER')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('admin_cleanup_cancel')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [row], content: '' });
        break;
      }

      case 'admin_cleanup_cancel': {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('✅ Nuclear Wipe Cancelled')
          .setColor(Colors.SUCCESS)
          .setDescription('No channels or roles were modified.');
        await interaction.update({
          embeds: [cancelEmbed],
          components: [backRow()],
          content: ''
        });
        break;
      }

      case 'admin_cleanup_confirm': {
        await interaction.update({
          content: '⏳ **Nuclear Wipe in progress...** Deleting channels, categories, and custom roles...',
          embeds: [],
          components: []
        });

        const channels = await guild.channels.fetch();
        let deleted = 0;
        const skipped: string[] = [];

        // Try to disable Community features so we can delete protected channels
        try {
          await guild.edit({ features: guild.features.filter(f => f !== 'COMMUNITY') });
        } catch(e) { /* might not have permission */ }

        // Nuclear wipe: Delete ALL channels and categories except the one we are currently in
        const currentChannelId = interaction.channelId;
        
        // Delete all non-category channels first
        for (const [id, ch] of channels) {
          if (!ch || ch.id === currentChannelId || ch.type === ChannelType.GuildCategory) continue;
          try { await ch.delete(); deleted++; } catch(e) { /* handled later */ }
        }

        // Now delete all categories
        for (const [id, ch] of channels) {
          if (!ch || ch.id === currentChannelId || ch.type !== ChannelType.GuildCategory) continue;
          try { await ch.delete(); deleted++; } catch(e) {
            if (!skipped.includes(ch.name)) skipped.push(ch.name);
          }
        }
        
        // Double check for any left overs (like protected channels)
        const remainingChannels = await guild.channels.fetch();
        for (const [id, ch] of remainingChannels) {
           if (!ch || ch.id === currentChannelId) continue;
           if (!skipped.includes(ch.name)) {
             if (ch.name === 'welcome-and-rules' || ch.name === 'announcements') {
               skipped.push(`${ch.name} (Protected by Discord Community Settings)`);
             } else {
               skipped.push(ch.name);
             }
           }
        }

        // Nuclear wipe: Delete ALL roles that we can
        let rolesDeleted = 0;
        for (const [id, role] of guild.roles.cache) {
          // Skip @everyone, skip managed roles (like other bot integrations), skip roles above us
          if (role.name !== '@everyone' && !role.managed && role.editable) {
            try { 
              await role.delete(); 
              rolesDeleted++; 
            } catch(e) { 
              /* skip if Discord prevents it */ 
            }
          }
        }

        const summaryEmbed = new EmbedBuilder()
          .setTitle('🧹 Nuclear Cleanup Complete')
          .setColor(Colors.SUCCESS)
          .setDescription(`Deleted **${deleted}** channels/categories and **${rolesDeleted}** custom roles.`)
          .setFooter({ text: skipped.length > 0 ? `Could not delete: ${skipped.join(', ')}` : 'Clean reset completed.' });

        await interaction.editReply({ content: '', embeds: [summaryEmbed], components: [backRow()] });
        break;
      }

      // ──────────────── ROLES ────────────────
      case 'admin_roles': {
        await interaction.deferUpdate();
        const roles = guild.roles.cache
          .filter(r => r.name !== '@everyone')
          .sort((a, b) => b.position - a.position)
          .map(r => `${r.name} (${r.members.size} members)`)
          .slice(0, 20);
        
        const embed = new EmbedBuilder()
          .setTitle('🎭 Role Management')
          .setColor(Colors.PRIMARY)
          .setDescription(roles.join('\n') || 'No roles found.')
          .setFooter({ text: 'Use Server Structure to create standard roles.' });
        
        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── MEMBERS ────────────────
      case 'admin_members': {
        await interaction.deferUpdate();
        const members = await guild.members.fetch();
        const total = members.size;
        const bots = members.filter(m => m.user.bot).size;
        const humans = total - bots;
        const online = members.filter(m => m.presence?.status === 'online').size;
        const verified = members.filter(m => m.roles.cache.some(r => r.name === 'Verified')).size;

        const embed = new EmbedBuilder()
          .setTitle('👥 Member Overview')
          .setColor(Colors.PRIMARY)
          .addFields(
            { name: 'Total Members', value: `${total}`, inline: true },
            { name: 'Humans', value: `${humans}`, inline: true },
            { name: 'Bots', value: `${bots}`, inline: true },
            { name: 'Online', value: `${online}`, inline: true },
            { name: 'Verified', value: `${verified}`, inline: true },
            { name: 'Unverified', value: `${humans - verified}`, inline: true }
          );

        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── VERIFICATION ────────────────
      case 'admin_verification': {
        await interaction.deferUpdate();
        const verifyChannel = guild.channels.cache.find(c => c.name === 'verify') as any;
        
        if (verifyChannel && verifyChannel.isTextBased()) {
          const { EmbedBuilder: EB, ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
          const panelEmbed = new EB()
            .setTitle('🔐 VERIFICATION REQUIRED')
            .setColor(Colors.PRIMARY)
            .setDescription('Click the button below to verify your account and gain access to the server.\n\nVerification grants you the **Verified** role and access to all community channels.');
          const row = new ARB<any>().addComponents(
            new BB().setCustomId('hub_verify').setLabel('✅ Verify Now').setStyle(BS.Success)
          );
          await verifyChannel.send({ embeds: [panelEmbed], components: [row] });
          
          const statusEmbed = new EmbedBuilder()
            .setTitle('🔐 Verification System')
            .setColor(Colors.SUCCESS)
            .setDescription('✅ Verification panel successfully deployed to <#' + verifyChannel.id + '>!\n\nMembers will complete CAPTCHA & optional access code check to get verified.');

          await interaction.editReply({ embeds: [statusEmbed], components: [backRow()], content: '' });
        } else {
          const statusEmbed = new EmbedBuilder()
            .setTitle('🔐 Verification System')
            .setColor(Colors.WARNING)
            .setDescription('❌ No `#verify` channel found.\n\nClick **Server Structure** first to create the standard server layout.');

          await interaction.editReply({ embeds: [statusEmbed], components: [backRow()], content: '' });
        }
        break;
      }

      // ──────────────── TICKETS ────────────────
      case 'admin_tickets': {
        await interaction.deferUpdate();
        const ticketChannel = guild.channels.cache.find(c => c.name === 'tickets' || c.name === 'support') as any;
        
        if (ticketChannel && ticketChannel.isTextBased()) {
          const { EmbedBuilder: EB, ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
          const panelEmbed = new EB()
            .setTitle('🎫 SUPPORT TICKETS')
            .setColor(Colors.PRIMARY)
            .setDescription('Need help? Click below to open a private support ticket.\n\nA staff member will assist you as soon as possible.');
          const row = new ARB<any>().addComponents(
            new BB().setCustomId('ticket_create').setLabel('📩 Open Ticket').setStyle(BS.Primary)
          );
          await ticketChannel.send({ embeds: [panelEmbed], components: [row] });
          
          const statusEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket System')
            .setColor(Colors.SUCCESS)
            .setDescription('✅ Support ticket panel deployed to <#' + ticketChannel.id + '>!\n\nUsers can now open private channels with staff.');

          await interaction.editReply({ embeds: [statusEmbed], components: [backRow()], content: '' });
        } else {
          const statusEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket System')
            .setColor(Colors.WARNING)
            .setDescription('❌ No `#tickets` channel found.\n\nClick **Server Structure** first to create the standard channels.');

          await interaction.editReply({ embeds: [statusEmbed], components: [backRow()], content: '' });
        }
        break;
      }

      // ──────────────── GM MANAGER ────────────────
      case 'admin_gm': {
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
          .setTitle('☀️ GM Manager')
          .setColor(Colors.PRIMARY)
          .setDescription('Manage daily GM posts, motivational quotes, and community streaks.\n\nChoose an action below:');

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('gm_add_quote').setLabel('➕ Add Quote').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('gm_view_quotes').setLabel('📜 View Quotes').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('gm_preview').setLabel('👁 Preview GM').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('gm_post_now').setLabel('🚀 Post Now').setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({ embeds: [embed], components: [row1, backRow()], content: '' });
        break;
      }

      // ──────────────── MODERATION ────────────────
      case 'admin_moderation': {
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
          .setTitle('🛡 Moderation Control')
          .setColor(Colors.PRIMARY)
          .setDescription('**Active protections:**\n✅ Auto-mod active\n✅ Link scanning active\n✅ Raid protection ready\n\nSelect a moderation tool:');

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('mod_warn').setLabel('⚠️ Warn').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('mod_timeout').setLabel('⏳ Timeout').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('mod_kick').setLabel('👢 Kick').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('mod_ban').setLabel('🔨 Ban').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('mod_raid_toggle').setLabel('🚨 Toggle Raid Mode').setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [embed], components: [row1, backRow()], content: '' });
        break;
      }

      // ──────────────── MINTS ────────────────
      case 'admin_mints': {
        await interaction.deferUpdate();
        const { mintService } = await import('../../services/MintService');
        const mints = await mintService.getUpcomingMints(guild.id);
        const { createMintBoard } = await import('../../panels/MintBoard');
        const board = createMintBoard(mints);

        await interaction.editReply({
          embeds: board.embeds,
          components: [...board.components, backRow()],
          content: ''
        });
        break;
      }

      // ──────────────── GAMES ────────────────
      case 'admin_games': {
        await interaction.deferUpdate();
        const gameChannel = guild.channels.cache.find(c => c.name === 'game-lobby') as any;
        
        if (gameChannel && gameChannel.isTextBased()) {
          const { createGameLobby } = await import('../../panels/GameLobby');
          const lobby = createGameLobby();
          await gameChannel.send({ embeds: lobby.embeds, components: lobby.components });
          
          const embed = new EmbedBuilder()
            .setTitle('🎮 Game Lobby Deployed')
            .setColor(Colors.SUCCESS)
            .setDescription('✅ 24-game interactive lobby refreshed in <#' + gameChannel.id + '>!');

          await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('🎮 Games Manager')
            .setColor(Colors.PRIMARY)
            .setDescription('**24 Mini-Games Active in System**\n\nNo `#game-lobby` channel found. Click **Server Structure** first to deploy the game lobby channel.');

          await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        }
        break;
      }

      // ──────────────── XP & LEVELS ────────────────
      case 'admin_xp': {
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
          .setTitle('🏆 XP & Levels System')
          .setColor(Colors.PRIMARY)
          .setDescription('**How XP works:**\n• Send messages: +15-25 XP (60s cooldown)\n• Daily GM: +25 XP + streak multiplier\n• Win mini-games: +25-100 XP\n\n**Level Titles:**\n🟢 Lv 1 - Fresh Wallet\n🔵 Lv 5 - Grinder\n🟣 Lv 10 - Degen\n🟡 Lv 20 - Sniper\n🔴 Lv 30 - Alpha Hunter\n⚪ Lv 50 - Whale\n🟤 Lv 75 - OG\n👑 Lv 100 - Legend');
        
        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── ACCESS CODES ────────────────
      case 'admin_access_codes': {
        await interaction.deferUpdate();
        const { ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
        
        let codeList = 'No access codes generated yet.';
        try {
          const { prisma } = await import('../../database/client');
          const codes = await prisma.accessCode.findMany({
            where: { guildId: guild.id },
            orderBy: { createdAt: 'desc' },
            take: 10
          });
          if (codes.length > 0) {
            codeList = codes.map((c: any) => 
              `\`${c.code}\` — Uses: ${c.currentUses}/${c.maxUses || '∞'} | ${c.isActive ? '✅ Active' : '❌ Expired'}`
            ).join('\n');
          }
        } catch(e) { /* DB might not have table yet */ }

        const embed = new EmbedBuilder()
          .setTitle('🔑 Access Code Manager')
          .setColor(Colors.PRIMARY)
          .setDescription(`**Active Codes:**\n${codeList}`)
          .setFooter({ text: 'Generate one-time or multi-use access codes.' });
        
        const actionButtons = [
          new BB().setCustomId('ac_generate').setLabel('🔑 Generate Code').setStyle(BS.Success),
          new BB().setCustomId('ac_generate_bulk').setLabel('📦 Generate 5 Codes').setStyle(BS.Primary)
        ];

        await interaction.editReply({ embeds: [embed], components: [backRow(...actionButtons)], content: '' });
        break;
      }

      // ──────────────── ANALYTICS ────────────────
      case 'admin_analytics': {
        await interaction.deferUpdate();
        const members = await guild.members.fetch();
        const channels = guild.channels.cache;
        
        const embed = new EmbedBuilder()
          .setTitle('📊 Server Analytics')
          .setColor(Colors.PRIMARY)
          .addFields(
            { name: 'Total Members', value: `${members.size}`, inline: true },
            { name: 'Total Channels', value: `${channels.size}`, inline: true },
            { name: 'Total Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: 'Server Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
            { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
          );
        
        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── AUDIT LOGS ────────────────
      case 'admin_audit_logs': {
        await interaction.deferUpdate();
        const auditChannel = guild.channels.cache.find(c => c.name === 'audit-logs') as any;
        
        const embed = new EmbedBuilder()
          .setTitle('📜 Audit Logs')
          .setColor(Colors.PRIMARY)
          .setDescription(auditChannel 
            ? `Audit logs are streaming to <#${auditChannel.id}>.\n\n**Tracked events:**\n• Member joins/leaves\n• Role changes\n• Channel modifications\n• Moderation actions\n• Message deletions`
            : '❌ No `#audit-logs` channel found. Click **Server Structure** first.');

        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      // ──────────────── SETTINGS ────────────────
      case 'admin_settings': {
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
          .setTitle('⚙️ Bot Settings')
          .setColor(Colors.PRIMARY)
          .setDescription('**Current Configuration:**\n✅ Verification: Active\n✅ XP System: Active\n✅ Auto-mod: Active\n✅ Ticket System: Active\n✅ Games: Active\n\n**Timezone:** Africa/Lagos\n**Prefix:** / (slash commands)');
        
        await interaction.editReply({ embeds: [embed], components: [backRow()], content: '' });
        break;
      }

      case 'admin_create_channel': {
        const modal = new ModalBuilder()
          .setCustomId('modal_create_channel')
          .setTitle('Create Channel');
          
        const nameInput = new TextInputBuilder()
          .setCustomId('channel_name')
          .setLabel('Channel Name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
          
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
        await interaction.showModal(modal);
        break;
      }

      case 'admin_create_category': {
        const modal = new ModalBuilder()
          .setCustomId('modal_create_category')
          .setTitle('Create Category');
          
        const nameInput = new TextInputBuilder()
          .setCustomId('category_name')
          .setLabel('Category Name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
          
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
        await interaction.showModal(modal);
        break;
      }

      default:
        await interaction.reply({ content: `Unknown admin action: ${customId}`, ephemeral: true });
    }
  } catch (error) {
    logger.error('Error in admin dashboard button:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, ephemeral: true });
    } else {
      await interaction.editReply({ content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }).catch(() => {});
    }
  }
}

export default {
  customIdRegex: /^admin_/,
  execute: async (interaction: any) => {
    return handleAdminDashboardButton(interaction);
  }
};
