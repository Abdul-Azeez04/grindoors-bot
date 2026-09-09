import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { ModerationService } from '../../services/ModerationService';
import { logger } from '../../utils/logger';
import { Colors } from '../../config/constants';

export const customIdRegex = /^modal_mod_/;

export const execute = async (interaction: ModalSubmitInteraction): Promise<void> => {
  try {
    await interaction.deferReply({ ephemeral: true });

    // The customId format can be modal_mod_warn or modal_mod_warn:USERID
    const parts = interaction.customId.split(':');
    const action = parts[0]; // e.g., modal_mod_warn
    
    // Read targetId from either the modal text input or the customId parameter
    let targetId = parts[1];
    try {
      const inputTarget = interaction.fields.getTextInputValue('target_id');
      if (inputTarget) targetId = inputTarget.trim();
    } catch {
      // No target_id field in modal, fallback to parts[1]
    }
    
    let reason = 'No reason provided';
    try {
      const inputReason = interaction.fields.getTextInputValue('reason');
      if (inputReason) reason = inputReason;
    } catch {
      // optional
    }
    
    if (!targetId) {
      await interaction.editReply('❌ Could not determine target user. Please specify a valid User ID.');
      return;
    }

    const member = await interaction.guild?.members.fetch(targetId).catch(() => null);
    if (!member) {
      await interaction.editReply(`❌ Target user (${targetId}) was not found in this server.`);
      return;
    }

    let successMsg = '';

    if (action === 'modal_mod_warn') {
      let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      try {
        const inputSeverity = interaction.fields.getTextInputValue('severity')?.toUpperCase();
        if (inputSeverity === 'LOW' || inputSeverity === 'MEDIUM' || inputSeverity === 'HIGH') {
          severity = inputSeverity;
        }
      } catch {}
      await ModerationService.warnMember(interaction.guildId!, targetId, interaction.user.id, reason, severity);
      successMsg = `⚠️ Warned **${member.user.tag}** (Severity: ${severity}) for: ${reason}`;
    } 
    else if (action === 'modal_mod_timeout') {
      let durationStr = '60';
      try {
        durationStr = interaction.fields.getTextInputValue('duration') || '60';
      } catch {}
      const duration = parseInt(durationStr, 10);
      if (isNaN(duration) || duration <= 0) {
        await interaction.editReply('❌ Invalid duration (must be a positive number of minutes).');
        return;
      }
      
      await member.timeout(duration * 60 * 1000, reason).catch(e => { throw new Error(`Missing permissions to timeout this user: ${e.message}`); });
      await ModerationService.logAction(interaction.guildId!, 'TIMEOUT', targetId, interaction.user.id, reason, duration * 60);
      successMsg = `⏱️ Timed out **${member.user.tag}** for ${duration} minutes. Reason: ${reason}`;
    }
    else if (action === 'modal_mod_kick') {
      await member.kick(reason).catch(e => { throw new Error(`Missing permissions to kick this user: ${e.message}`); });
      await ModerationService.logAction(interaction.guildId!, 'KICK', targetId, interaction.user.id, reason);
      successMsg = `👢 Kicked **${member.user.tag}**. Reason: ${reason}`;
    }
    else if (action === 'modal_mod_ban') {
      await member.ban({ reason }).catch(e => { throw new Error(`Missing permissions to ban this user: ${e.message}`); });
      await ModerationService.logAction(interaction.guildId!, 'BAN', targetId, interaction.user.id, reason);
      successMsg = `🔨 Banned **${member.user.tag}**. Reason: ${reason}`;
    }
    else {
      await interaction.editReply(`❌ Unknown moderation action: ${action}`);
      return;
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

export default {
  customIdRegex,
  execute
};
