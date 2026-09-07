import { ButtonInteraction } from 'discord.js';
import { captchaService } from '../../services/CaptchaService';
import { verificationService } from '../../services/VerificationService';
import { discordVerificationService } from '../../services/DiscordVerificationService';
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
      
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member) return;

      const discordCheck = discordVerificationService.checkMember(member, { minAccountAgeDays: 7, requireScreening: false });

      if (discordCheck.passed) {
        await verificationService.moveToWaitingRoom(interaction.guildId!, interaction.user.id);
        await interaction.followUp({ content: 'CAPTCHA passed! Please click ENTER ACCESS CODE on the panel to complete your verification.', ephemeral: true });
      } else {
        await interaction.followUp({ content: `Discord checks failed:\n${discordCheck.failures.join('\n')}`, ephemeral: true });
      }
    } else {
      if (result.attemptsLeft === 0) {
        await interaction.followUp({ content: result.message, ephemeral: true });
      } else {
        await interaction.followUp({ content: result.message, ephemeral: true });
      }
    }
  } catch (error) {
    logger.error(error);
    await interaction.followUp({ content: 'An error occurred.', ephemeral: true });
  }
};
