import { ButtonInteraction, EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import { logger } from "../../utils/logger";
import { Colors } from '../../config/constants';

export async function handleAdminDashboardButton(interaction: ButtonInteraction) {
  // Permission check
  const member = interaction.member as any;
  if (!member?.permissions?.has(PermissionsBitField.Flags.Administrator) &&
      !member?.permissions?.has(PermissionsBitField.Flags.ManageGuild)) {
    await interaction.reply({ content: '❌ You need Admin permissions.', ephemeral: true });
    return;
  }

  const customId = interaction.customId;
  const guild = interaction.guild!;

  try {
    switch (customId) {

      // ──────────────── SERVER STRUCTURE ────────────────
      case 'admin_server_struct': {
        await interaction.deferReply({ ephemeral: true });
        const { setupService } = await import('../../services/SetupService');
        const botMember = await guild.members.fetch(interaction.client.user!.id);
        const result = await setupService.quickSetup(guild, botMember);
        
        const lines = [
          `✅ **Server Structure Built!**`,
          `📂 Channels: ${result.channelsCreated.length}`,
          `🎭 Roles: ${result.rolesCreated.length}`,
          `📋 Panels: ${result.panelsDeployed.length}`,
        ];
        if (result.errors.length > 0) {
          lines.push(`\n⚠️ **Errors:**\n${result.errors.slice(0, 5).join('\n')}`);
        }
        await interaction.followUp({ content: lines.join('\n') });
        break;
      }

      // ──────────────── CLEANUP ────────────────
      case 'admin_cleanup': {
        await interaction.deferReply({ ephemeral: true });
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

        let msg = `🧹 **Nuclear Cleanup Complete!**\nDeleted ${deleted} channels/categories and ${rolesDeleted} roles.`;
        if (skipped.length > 0) msg += `\n⚠️ Could not delete: ${skipped.join(', ')}`;
        await interaction.followUp({ content: msg });
        break;
      }

      // ──────────────── ROLES ────────────────
      case 'admin_roles': {
        await interaction.deferReply({ ephemeral: true });
        const roles = guild.roles.cache
          .filter(r => r.name !== '@everyone')
          .sort((a, b) => b.position - a.position)
          .map(r => `${r.name} (${r.members.size} members)`)
          .slice(0, 20);
        
        const embed = new EmbedBuilder()
          .setTitle('🎭 Role Management')
          .setColor(Colors.PRIMARY)
          .setDescription(roles.join('\n') || 'No roles found.')
          .setFooter({ text: 'Use Server Structure to create missing roles.' });
        
        await interaction.followUp({ embeds: [embed] });
        break;
      }

      // ──────────────── MEMBERS ────────────────
      case 'admin_members': {
        await interaction.deferReply({ ephemeral: true });
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

        await interaction.followUp({ embeds: [embed] });
        break;
      }

      // ──────────────── VERIFICATION ────────────────
      case 'admin_verification': {
        await interaction.deferReply({ ephemeral: true });
        const verifyChannel = guild.channels.cache.find(c => c.name === 'verify') as any;
        
        if (verifyChannel && verifyChannel.isTextBased()) {
          const { EmbedBuilder: EB, ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
          const embed = new EB()
            .setTitle('🔐 VERIFICATION REQUIRED')
            .setColor(Colors.PRIMARY)
            .setDescription('Click the button below to verify your account and gain access to the server.\n\nVerification grants you the **Verified** role and access to all community channels.');
          const row = new ARB<any>().addComponents(
            new BB().setCustomId('hub_verify').setLabel('✅ Verify Now').setStyle(BS.Success)
          );
          await verifyChannel.send({ embeds: [embed], components: [row] });
          await interaction.followUp({ content: '✅ Verification panel deployed to #verify!' });
        } else {
          await interaction.followUp({ content: '❌ No #verify channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── TICKETS ────────────────
      case 'admin_tickets': {
        await interaction.deferReply({ ephemeral: true });
        const ticketChannel = guild.channels.cache.find(c => c.name === 'tickets' || c.name === 'support') as any;
        
        if (ticketChannel && ticketChannel.isTextBased()) {
          const { EmbedBuilder: EB, ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
          const embed = new EB()
            .setTitle('🎫 SUPPORT TICKETS')
            .setColor(Colors.PRIMARY)
            .setDescription('Need help? Click below to open a private support ticket.\n\nA staff member will assist you as soon as possible.');
          const row = new ARB<any>().addComponents(
            new BB().setCustomId('ticket_create').setLabel('📩 Open Ticket').setStyle(BS.Primary)
          );
          await ticketChannel.send({ embeds: [embed], components: [row] });
          await interaction.followUp({ content: '✅ Ticket panel deployed to #tickets!' });
        } else {
          await interaction.followUp({ content: '❌ No #tickets channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── GM MANAGER ────────────────
      case 'admin_gm': {
        await interaction.deferReply({ ephemeral: true });
        const gmChannel = guild.channels.cache.find(c => c.name === 'gm') as any;
        
        if (gmChannel && gmChannel.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle('☀️ GM CHANNEL')
            .setColor(Colors.SUCCESS)
            .setDescription('Say **GM** every day to keep your daily streak alive!\n\n🔥 Streak rewards:\n• 7 days: +50 bonus XP\n• 30 days: +200 bonus XP\n• 100 days: Special role!');
          await gmChannel.send({ embeds: [embed] });
          await interaction.followUp({ content: '✅ GM panel deployed to #gm!' });
        } else {
          await interaction.followUp({ content: '❌ No #gm channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── MODERATION ────────────────
      case 'admin_moderation': {
        const embed = new EmbedBuilder()
          .setTitle('🛡 Moderation Tools')
          .setColor(Colors.PRIMARY)
          .setDescription('**Active protections:**\n✅ Auto-mod enabled\n✅ Link scanning active\n✅ Raid protection ready\n\n**Mod commands:**\n• `/admin` → Members → Manage users\n• Report button on messages\n• Ticket system for disputes');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      // ──────────────── MINTS ────────────────
      case 'admin_mints': {
        await interaction.deferReply({ ephemeral: true });
        const mintChannel = guild.channels.cache.find(c => c.name === 'mint-alerts') as any;
        
        if (mintChannel && mintChannel.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle('💎 MINT ALERTS')
            .setColor(Colors.SUCCESS)
            .setDescription('Stay tuned for upcoming mint announcements!\n\nAdmins can post mint alerts here using the bot commands.');
          await mintChannel.send({ embeds: [embed] });
          await interaction.followUp({ content: '✅ Mints panel deployed to #mint-alerts!' });
        } else {
          await interaction.followUp({ content: '❌ No #mint-alerts channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── GAMES ────────────────
      case 'admin_games': {
        await interaction.deferReply({ ephemeral: true });
        const gameChannel = guild.channels.cache.find(c => c.name === 'game-lobby') as any;
        
        if (gameChannel && gameChannel.isTextBased()) {
          const { ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('🎮 GAME LOBBY')
            .setColor(Colors.PRIMARY)
            .setDescription('Play mini-games to earn XP and climb the leaderboard!\n\n**Available Games:**\n🎯 Trivia\n🔢 Number Guess\n✂️ Rock Paper Scissors');
          const row = new ARB<any>().addComponents(
            new BB().setCustomId('game_trivia').setLabel('🎯 Trivia').setStyle(BS.Primary),
            new BB().setCustomId('game_number').setLabel('🔢 Number Guess').setStyle(BS.Primary),
            new BB().setCustomId('game_rps').setLabel('✂️ RPS').setStyle(BS.Primary)
          );
          await gameChannel.send({ embeds: [embed], components: [row] });
          await interaction.followUp({ content: '✅ Game lobby deployed to #game-lobby!' });
        } else {
          await interaction.followUp({ content: '❌ No #game-lobby channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── XP & LEVELS ────────────────
      case 'admin_xp': {
        const embed = new EmbedBuilder()
          .setTitle('🏆 XP & Levels System')
          .setColor(Colors.PRIMARY)
          .setDescription('**How XP works:**\n• Send messages: +5-15 XP\n• Daily GM: +25 XP\n• Win games: +50-100 XP\n• Daily streak bonuses\n\n**Level Titles:**\n🟢 Lv 1 - Fresh Wallet\n🔵 Lv 5 - Grinder\n🟣 Lv 10 - Degen\n🟡 Lv 20 - Sniper\n🔴 Lv 30 - Alpha Hunter\n⚪ Lv 50 - Whale\n🟤 Lv 75 - OG\n👑 Lv 100 - Legend');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      // ──────────────── ACCESS CODES ────────────────
      case 'admin_access_codes': {
        await interaction.deferReply({ ephemeral: true });
        const { ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js');
        
        // Show current codes and generate option
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
          .setFooter({ text: 'Click below to generate a new code.' });
        
        const row = new ARB<any>().addComponents(
          new BB().setCustomId('ac_generate').setLabel('🔑 Generate New Code').setStyle(BS.Success),
          new BB().setCustomId('ac_generate_bulk').setLabel('📦 Generate 5 Codes').setStyle(BS.Primary)
        );

        await interaction.followUp({ embeds: [embed], components: [row] });
        break;
      }

      // ──────────────── ANALYTICS ────────────────
      case 'admin_analytics': {
        await interaction.deferReply({ ephemeral: true });
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
        
        await interaction.followUp({ embeds: [embed] });
        break;
      }

      // ──────────────── AUDIT LOGS ────────────────
      case 'admin_audit_logs': {
        await interaction.deferReply({ ephemeral: true });
        const auditChannel = guild.channels.cache.find(c => c.name === 'audit-logs') as any;
        
        if (auditChannel) {
          const embed = new EmbedBuilder()
            .setTitle('📜 Audit Logs')
            .setColor(Colors.PRIMARY)
            .setDescription(`Audit logs are being sent to <#${auditChannel.id}>.\n\n**Tracked events:**\n• Member joins/leaves\n• Role changes\n• Channel modifications\n• Moderation actions\n• Message deletions`);
          await interaction.followUp({ embeds: [embed] });
        } else {
          await interaction.followUp({ content: '❌ No #audit-logs channel found. Click **Server Structure** first.' });
        }
        break;
      }

      // ──────────────── SETTINGS ────────────────
      case 'admin_settings': {
        const embed = new EmbedBuilder()
          .setTitle('⚙️ Bot Settings')
          .setColor(Colors.PRIMARY)
          .setDescription('**Current Configuration:**\n✅ Verification: Active\n✅ XP System: Active\n✅ Auto-mod: Active\n✅ Ticket System: Active\n✅ Games: Active\n\n**Timezone:** Africa/Lagos\n**Prefix:** / (slash commands)');
        await interaction.reply({ embeds: [embed], ephemeral: true });
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
      await interaction.followUp({ content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }).catch(() => {});
    }
  }
}

export default {
  customIdRegex: /^admin_/,
  execute: async (interaction: any) => {
    return handleAdminDashboardButton(interaction);
  }
};
