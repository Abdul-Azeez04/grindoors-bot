import { ButtonInteraction, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { captchaService } from '../../services/CaptchaService';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customId = 'verify_start';

export const execute = async (interaction: ButtonInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const status = await verificationService.getMemberStatus(interaction.guildId!, interaction.user.id);
    if (status?.status === 'VERIFIED') {
      return interaction.editReply('Already verified.');
    }

    const captcha = captchaService.generateCaptcha();
    captchaService.setCaptcha(interaction.guildId!, interaction.user.id, captcha.text);

    const attachment = new AttachmentBuilder(captcha.svgBuffer, { name: 'captcha.svg' });

    // Generate random wrong answers
    const generateWrongAnswer = () => Math.random().toString(36).substring(2, 8);
    const answers = [captcha.text, generateWrongAnswer(), generateWrongAnswer(), generateWrongAnswer()];
    answers.sort(() => Math.random() - 0.5); // shuffle

    const row = new ActionRowBuilder<ButtonBuilder>();
    answers.forEach((ans, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`captcha_answer_${ans.toLowerCase()}`)
          .setLabel(ans)
          .setStyle(ButtonStyle.Secondary)
      );
    });

    await interaction.editReply({
      content: 'Please select the text shown in the image below:',
      files: [attachment],
      components: [row]
    });
  } catch (error) {
    logger.error(error);
    await interaction.editReply('An error occurred during verification.');
  }
};
