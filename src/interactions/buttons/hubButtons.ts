import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { logger } from "../../utils/logger";
import { TicketService } from '../../services/TicketService';
import { createGameLobby } from '../../panels/GameLobby';
import { createLeaderboardPanel } from '../../panels/LeaderboardPanel';
import { createMintBoard } from '../../panels/MintBoard';
import { prisma } from '../../database/client';
import { Colors } from '../../config/constants';

export async function handleHubButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;
    const guild = interaction.guild!;
    
    switch (customId) {
      case 'hub_verify': {
        const { execute: startVerify } = await import('./verifyStart');
        await startVerify(interaction);
        break;
      }
      case 'hub_support':
        try {
          const { channel } = await TicketService.createTicket(interaction.guildId!, interaction.user.id, 'GENERAL', guild);
          await interaction.reply({ content: `✅ Ticket created: <#${channel.id}>`, ephemeral: true });
        } catch (err) {
          await interaction.reply({ content: '❌ Failed to create ticket.', ephemeral: true });
        }
        break;
      case 'hub_games': {
        const gameLobby = createGameLobby();
        await interaction.reply({ embeds: gameLobby.embeds, components: gameLobby.components, ephemeral: true });
        break;
      }
      case 'hub_leaderboard': {
        const leaderboard = await createLeaderboardPanel(guild.id);
        await interaction.reply({ ...leaderboard, ephemeral: true });
        break;
      }
      case 'hub_mints': {
        const { mintService } = await import('../../services/MintService');
        const mints = await mintService.getUpcomingMints(guild.id);
        const mintBoard = createMintBoard(mints);
        await interaction.reply({ ...mintBoard, ephemeral: true });
        break;
      }
      case 'hub_rules': {
        const rulesEmbed = new EmbedBuilder()
          .setTitle('📜 Server Rules')
          .setColor(Colors.PRIMARY)
          .setDescription('1. Be respectful to everyone.\n2. No spamming or self-promotion outside designated channels.\n3. Do not share malicious links or scams.\n4. Keep NSFW content out of the server.\n5. Follow Discord TOS.');
        await interaction.reply({ embeds: [rulesEmbed], ephemeral: true });
        break;
      }
      case 'hub_profile': {
        const memberRec = await prisma.member.findUnique({
          where: { discordId_guildId: { discordId: interaction.user.id, guildId: guild.id } }
        });
        if (memberRec) {
          const profileEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Profile`)
            .setColor(Colors.PRIMARY)
            .addFields(
              { name: 'Level', value: `${memberRec.level}`, inline: true },
              { name: 'XP', value: `${memberRec.xp}`, inline: true },
              { name: 'Games Won', value: `${memberRec.totalGamesWon}`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL());
          await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
        } else {
          await interaction.reply({ content: 'Profile not found. Send some messages to register!', ephemeral: true });
        }
        break;
      }
      case 'hub_daily':
        await interaction.reply({ content: 'Say GM in #gm to claim your daily streak!', ephemeral: true });
        break;
      case 'hub_stats': {
        const statsEmbed = new EmbedBuilder()
          .setTitle('📊 Server Stats')
          .setColor(Colors.PRIMARY)
          .addFields(
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true }
          );
        await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
        break;
      }
      default:
        await interaction.reply({ content: 'Unknown action.', ephemeral: true });
    }
  } catch (error) {
    logger.error('Error handling hub button:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
}

export default {
  customIdRegex: /^hub_/,
  execute: async (interaction: any) => {
    return handleHubButton(interaction);
  }
};
