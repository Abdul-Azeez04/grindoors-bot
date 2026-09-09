import { ButtonInteraction } from 'discord.js';
import { captchaService } from '../../services/CaptchaService';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customIdRegex = /^captcha_answer_(.*)$/;

export const execute = async (interaction: ButtonInteraction) => {
  try {
    await interaction.deferUpdate();
    
    const match = interaction.customId.match(customIdRegex);
    if (!match) return;
    const answer = match[1];

    const result = captchaService.verifyCaptcha(interaction.guildId!, interaction.user.id, answer);

    if (result.success) {
      await verificationService.completeCaptcha(interaction.guildId!, interaction.user.id);
      await verificationService.moveToWaitingRoom(interaction.guildId!, interaction.user.id);
      
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member) return;

      // Fetch fresh roles
      await interaction.guild?.roles.fetch();

      // Assign Waiting Room role, remove Unverified
      const unverifiedRole = interaction.guild?.roles.cache.find(r => r.name === 'Unverified');
      let waitingRoomRole = interaction.guild?.roles.cache.find(r => r.name === 'Waiting Room');

      if (!waitingRoomRole && interaction.guild) {
        waitingRoomRole = await interaction.guild.roles.create({ name: 'Waiting Room', color: '#e67e22' });
        logger.info('Auto-created missing Waiting Room role');
      }

      try {
        if (waitingRoomRole) {
          await member.roles.add(waitingRoomRole);
          logger.info(`Added Waiting Room role to ${member.user.tag}`);
        }
        if (unverifiedRole) {
          await member.roles.remove(unverifiedRole);
          logger.info(`Removed Unverified role from ${member.user.tag}`);
        }
      } catch (roleErr: any) {
        logger.error(`Role assignment failed after CAPTCHA: ${roleErr.message}`);
      }

      await interaction.followUp({ 
        content: '✅ **CAPTCHA passed!** You now have access to the waiting room.\n\nPlease click **ENTER ACCESS CODE** on the panel above to complete your verification.', 
        ephemeral: true 
      });
    } else {
      await interaction.followUp({ content: result.message, ephemeral: true });
    }
  } catch (error: any) {
    logger.error(error);
    await interaction.followUp({ content: `An error occurred: ${error.message}`, ephemeral: true }).catch(() => {});
  }
};

export default {
  customIdRegex,
  execute
};
