import { Message, EmbedBuilder } from 'discord.js';
import { LinkSecurityService } from '../services/LinkSecurityService';
import { ModerationService } from '../services/ModerationService';
import { AuditLogService } from '../services/AuditLogService';
import { Colors } from '../config/constants';
import { logger } from "../utils/logger";

export async function onMessageCreate(message: Message) {
  if (message.author.bot || !message.guild) return;

  // Link Security
  const linkCheck = LinkSecurityService.checkMessage(message.content);
  if (linkCheck.isSuspicious) {
    try {
      await message.delete();
      await message.channel.send(`<@${message.author.id}>, your message was removed for suspicious content.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      
      const logEmbed = new EmbedBuilder()
        .setTitle('Link Security Alert')
        .addFields(
          { name: 'User', value: `<@${message.author.id}> (${message.author.id})` },
          { name: 'Reasons', value: linkCheck.reasons.join(', ') },
          { name: 'Content', value: message.content }
        )
        .setColor(Colors.ERROR);
      await AuditLogService.sendModLog(message.guild, logEmbed);
      return;
    } catch (error) {
      logger.error(`Error handling suspicious link: ${error}`);
    }
  }

  // Spam Protection
  const spamCheck = await ModerationService.checkSpam(message.guild.id, message.author.id, message);
  if (spamCheck.isSpam) {
    try {
      await message.delete();
      await ModerationService.warnMember(message.guild.id, message.author.id, message.client.user!.id, spamCheck.reason || 'Spamming', 'MEDIUM');
      const logEmbed = new EmbedBuilder()
        .setTitle('Spam Detected')
        .addFields(
          { name: 'User', value: `<@${message.author.id}>` },
          { name: 'Reason', value: spamCheck.reason || 'Unknown' }
        )
        .setColor(Colors.WARNING);
      await AuditLogService.sendModLog(message.guild, logEmbed);
      return;
    } catch (error) {
      logger.error(`Error handling spam: ${error}`);
    }
  }

  // Everyone/Here Abuse
  if ((message.mentions.everyone || message.content.includes('@here') || message.content.includes('@everyone')) && !message.member?.permissions.has('MentionEveryone')) {
    try {
      await message.delete();
      await message.channel.send(`<@${message.author.id}>, you are not allowed to use mass mentions.`);
      return;
    } catch (error) {
      logger.error(`Error handling mass mention: ${error}`);
    }
  }

  // Excessive Caps
  if (message.content.length > 10) {
    const capsMatch = message.content.match(/[A-Z]/g);
    if (capsMatch && (capsMatch.length / message.content.length) > 0.7) {
      await message.channel.send(`<@${message.author.id}>, please turn off caps lock.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  }
}
