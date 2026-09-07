import { Guild, TextChannel, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import prisma from '../database/client';
import logger from '../utils/logger';
import { Colors } from '../config/constants';

export class TicketService {
  static async createTicket(guildId: string, creatorId: string, category: string, guild: Guild) {
    try {
      const creator = await guild.members.fetch(creatorId);
      const ticketCount = await prisma.ticket.count({ where: { guildId } });
      const channelName = `ticket-${creator.user.username}-${ticketCount + 1}`;

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: creatorId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
          // Add support/mod roles here ideally
        ],
      });

      const ticket = await prisma.ticket.create({
        data: {
          guildId,
          creatorId,
          channelId: channel.id,
          category,
          status: 'OPEN',
        }
      });

      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Created')
        .setDescription(`Welcome ${creator}! Support will be with you shortly.\n**Category:** ${category}`)
        .setColor(Colors.PRIMARY);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket_escalate')
          .setLabel('Escalate')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Close')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ content: `<@${creatorId}>`, embeds: [embed], components: [row] });

      return { ticket, channel };
    } catch (error) {
      logger.error(`Error creating ticket: ${error}`);
      throw error;
    }
  }

  static async claimTicket(ticketId: number, staffId: string) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLAIMED', claimedById: staffId }
    });
  }

  static async escalateTicket(ticketId: number) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ESCALATED' }
    });
  }

  static async closeTicket(ticketId: number, closedById: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', closedById }
    });
    // In a real app we might fetch the channel and delete it or archive it.
    return ticket;
  }

  static async getOpenTickets(guildId: string) {
    return prisma.ticket.findMany({
      where: { guildId, status: { not: 'CLOSED' } }
    });
  }

  static async getTicketById(ticketId: number) {
    return prisma.ticket.findUnique({ where: { id: ticketId } });
  }
}
