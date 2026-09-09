import { ButtonInteraction, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { captchaService } from '../../services/CaptchaService';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customId = 'verify_start';

export const execute = async (interaction: ButtonInteraction): Promise<void> => {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const status = await verificationService.getMemberStatus(interaction.guildId!, interaction.user.id);
    if (status?.verificationStatus === 'VERIFIED') {
      await interaction.editReply('Already verified.');
      return;
    }

    if (!status) {
      await verificationService.startVerification(interaction.guildId!, interaction.user.id, interaction.user.username);
    }

    const captcha = captchaService.generateCaptcha();
    captchaService.setCaptcha(interaction.guildId!, interaction.user.id, captcha.text);

    // Shuffle array function
    const shuffleArray = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Generate 3 random incorrect math answers
    const generateWrongAnswer = () => {
      let wrong = parseInt(captcha.text) + Math.floor(Math.random() * 10) - 5;
      if (wrong === parseInt(captcha.text)) wrong += 1;
      return wrong.toString();
    };

    const answers = shuffleArray([captcha.text, generateWrongAnswer(), generateWrongAnswer(), generateWrongAnswer()]);

    const row = new ActionRowBuilder<ButtonBuilder>();
    answers.forEach((ans) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`captcha_answer_${ans}`)
          .setLabel(ans)
          .setStyle(ButtonStyle.Secondary)
      );
    });

    await interaction.editReply({
      content: `🔒 **SECURITY CHECK**\n\n${captcha.question}\n\nPlease select the correct answer below:`,
      components: [row]
    });
  } catch (error: any) {
    logger.error(error);
    await interaction.editReply(`An error occurred during verification: ${error.message}\nStack: ${error.stack?.substring(0, 500)}`);
  }
};
