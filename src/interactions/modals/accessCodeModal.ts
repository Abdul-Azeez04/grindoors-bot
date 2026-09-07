import { ModalSubmitInteraction } from 'discord.js';
import { accessCodeService } from '../../services/AccessCodeService';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customId = 'modal_access_code';

export const execute = async (interaction: ModalSubmitInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const code = interaction.fields.getTextInputValue('access_code_input');

    const validation = await accessCodeService.validateCode(interaction.guildId!, code, interaction.user.id);

    if (!validation.valid || !validation.accessCode) {
      return interaction.editReply('❌ Invalid or expired access code.');
    }

    await accessCodeService.useCode(validation.accessCode.id, interaction.user.id);
    await verificationService.completeVerification(interaction.guildId!, interaction.user.id);

    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (member) {
      const unverifiedRole = interaction.guild?.roles.cache.find(r => r.name === 'Unverified');
      const waitingRoomRole = interaction.guild?.roles.cache.find(r => r.name === 'Waiting Room');
      const memberRole = interaction.guild?.roles.cache.find(r => r.name === 'Member');

      if (unverifiedRole) await member.roles.remove(unverifiedRole);
      if (waitingRoomRole) await member.roles.remove(waitingRoomRole);
      if (memberRole) await member.roles.add(memberRole);
      if (validation.accessCode.roleId) {
        const customRole = interaction.guild?.roles.cache.get(validation.accessCode.roleId);
        if (customRole) await member.roles.add(customRole);
      }
    }

    await interaction.editReply('✅ Welcome to the community!');
  } catch (error) {
    logger.error(error);
    await interaction.editReply('An error occurred during code validation.');
  }
};
