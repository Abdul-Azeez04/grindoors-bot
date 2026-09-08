import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { moderationService } from '../../services/ModerationService';
import { logger } from '../../utils/logger';
import { Colors } from '../../config/constants';

export const customIdRegex = /^modal_mod_/;

export const execute = async (interaction: ModalSubmitInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    // The customId format is: modal_mod_warn:USERID
    // Let's extract the action and target userId
    const parts = interaction.customId.split(':');
    const action = parts[0]; // e.g., modal_mod_warn
    const targetId = parts[1];
    const reason = interaction.fields.getTextInputValue('reason') || 'No reason provided';
    
    if (!targetId) {
      return interaction.editReply('❌ Could not determine target user.');
    }

    const member = await interaction.guild?.members.fetch(targetId).catch(() => null);
    if (!member) {
      return interaction.editReply('❌ Target user is no longer in the server.');
    }

    let successMsg = '';

    if (action === 'modal_mod_warn') {
      await moderationService.warnMember(interaction.guildId!, targetId, interaction.user.id, reason, 'MEDIUM');
      successMsg = `⚠️ Warned **${member.user.tag}** for: ${reason}`;
    } 
    else if (action === 'modal_mod_timeout') {
      const durationStr = interaction.fields.getTextInputValue('duration') || '60';
      const duration = parseInt(durationStr, 10);
      if (isNaN(duration)) return interaction.editReply('❌ Invalid duration (must be a number of minutes).');
      
      await member.timeout(duration * 60 * 1000, reason).catch(e => { throw new Error('Missing permissions to timeout this user'); });
      await moderationService.logAction(interaction.guildId!, targetId, interaction.user.id, 'TIMEOUT', reason, duration);
      successMsg = `⏱️ Timed out **${member.user.tag}** for ${duration} minutes. Reason: ${reason}`;
    }
    else if (action === 'modal_mod_kick') {
      await member.kick(reason).catch(e => { throw new Error('Missing permissions to kick this user'); });
      await moderationService.logAction(interaction.guildId!, targetId, interaction.user.id, 'KICK', reason);
      successMsg = `👢 Kicked **${member.user.tag}**. Reason: ${reason}`;
    }
    else if (action === 'modal_mod_ban') {
      await member.ban({ reason }).catch(e => { throw new Error('Missing permissions to ban this user'); });
      await moderationService.logAction(interaction.guildId!, targetId, interaction.user.id, 'BAN', reason);
      successMsg = `🔨 Banned **${member.user.tag}**. Reason: ${reason}`;
    }
    else {
      return interaction.editReply(`❌ Unknown moderation action: ${action}`);
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.SUCCESS)
      .setDescription(successMsg);

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    logger.error('Error handling moderation modal:', error);
    await interaction.editReply(`❌ Failed to execute action: ${error.message}`);
  }
};
