import { Message, EmbedBuilder } from 'discord.js';
import { LinkSecurityService } from '../services/LinkSecurityService';
import { ModerationService } from '../services/ModerationService';
import { AuditLogService } from '../services/AuditLogService';
import { XPService } from '../services/XPService';
import { prisma } from '../database/client';
import { Colors } from '../config/constants';
import { logger } from "../utils/logger";
import { EventHandler } from '../types';

const event: EventHandler = {
  name: 'messageCreate',
  once: false,
  execute: async (message: Message) => {
    if (message.author.bot || !message.guild) return;

    // 1. Link Security Check
    const linkCheck = LinkSecurityService.checkMessage(message.content);
    if (linkCheck.isSuspicious) {
      try {
        await message.delete();
        if ('send' in message.channel) {
          await (message.channel as any).send(`<@${message.author.id}>, your message was removed for suspicious content.`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
        
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

    // 2. Spam Protection
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

    // 3. Mass Mention Abuse Check
    if ((message.mentions.everyone || message.content.includes('@here') || message.content.includes('@everyone')) && !message.member?.permissions.has('MentionEveryone')) {
      try {
        await message.delete();
        if ('send' in message.channel) {
          await (message.channel as any).send(`<@${message.author.id}>, you are not allowed to use mass mentions.`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
        return;
      } catch (error) {
        logger.error(`Error handling mass mention: ${error}`);
      }
    }

    // 4. Excessive Caps Check
    if (message.content.length > 10) {
      const capsMatch = message.content.match(/[A-Z]/g);
      if (capsMatch && (capsMatch.length / message.content.length) > 0.7) {
        if ('send' in message.channel) {
          await (message.channel as any).send(`<@${message.author.id}>, please turn off caps lock.`).then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
      }
    }

    // 5. Daily GM Handling in #gm or GM messages
    const isGMChannel = 'name' in message.channel && (message.channel as any).name === 'gm';
    const textLower = message.content.trim().toLowerCase();
    const isGMMessage = textLower === 'gm' || textLower === 'good morning' || textLower.startsWith('gm ');

    if (isGMChannel || (isGMMessage && message.content.length <= 15)) {
      try {
        const member = await prisma.member.findUnique({
          where: { discordId_guildId: { discordId: message.author.id, guildId: message.guild.id } }
        });

        const now = new Date();
        const lastDaily = member?.lastDailyAt ? new Date(member.lastDailyAt) : null;
        const isNewDay = !lastDaily || (now.getTime() - lastDaily.getTime()) >= (20 * 60 * 60 * 1000); // at least 20h

        if (isNewDay) {
          const currentStreak = ((lastDaily && (now.getTime() - lastDaily.getTime()) < 48 * 60 * 60 * 1000) ? (member?.dailyStreak || 0) : 0) + 1;
          
          await prisma.member.upsert({
            where: { discordId_guildId: { discordId: message.author.id, guildId: message.guild.id } },
            create: {
              discordId: message.author.id,
              guildId: message.guild.id,
              username: message.author.username,
              joinedAt: new Date(),
              dailyStreak: 1,
              lastDailyAt: now,
              xp: 25,
              level: 1
            },
            update: {
              dailyStreak: currentStreak,
              lastDailyAt: now
            }
          });

          await XPService.awardXP(message.guild.id, message.author.id, 25, 'DAILY', `Daily GM (Streak: ${currentStreak})`);
          await message.react('☀️').catch(() => {});
          
          if (currentStreak % 7 === 0) {
            await (message.channel as any).send(`🔥 **${message.author.username}** reached a **${currentStreak}-day GM streak**! (+50 Bonus XP)`).catch(() => {});
            await XPService.awardXP(message.guild.id, message.author.id, 50, 'STREAK', `Streak Milestone: ${currentStreak} days`);
          }
        } else {
          await message.react('☕').catch(() => {});
        }
      } catch (err) {
        logger.error(`Error processing GM streak for ${message.author.id}:`, err);
      }
    }

    // 6. Chat Activity XP (Award 5-15 XP once per 60 seconds per user)
    try {
      const cooldownMs = 60 * 1000;
      if (!XPService.isOnCooldown(message.guild.id, message.author.id, cooldownMs)) {
        const randomXP = Math.floor(Math.random() * 11) + 5; // 5 to 15 XP
        const result = await XPService.awardXP(message.guild.id, message.author.id, randomXP, 'OTHER', 'Chat Activity');
        
        if (result.leveledUp && result.newLevel) {
          const levelInfo = XPService.getLevelForXP(result.newXP);
          const levelEmbed = new EmbedBuilder()
            .setTitle('🎉 Level Up!')
            .setDescription(`Congratulations <@${message.author.id}>! You reached **Level ${result.newLevel} - ${levelInfo.name}**!`)
            .setColor(Colors.SUCCESS);
          if ('send' in message.channel) {
            await (message.channel as any).send({ embeds: [levelEmbed] }).catch(() => {});
          }
        }
      }
    } catch (xpErr) {
      // Non-critical, avoid crashing
    }
  }
};

export default event;
