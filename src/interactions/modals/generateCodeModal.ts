import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { accessCodeService } from '../../services/AccessCodeService';
import { Colors } from '../../config/constants';
import { logger } from '../../utils/logger';

export const customId = 'modal_generate_code';

export const execute = async (interaction: ModalSubmitInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const name = interaction.fields.getTextInputValue('code_name');
    const maxUsesStr = interaction.fields.getTextInputValue('code_max_uses');
    const expiresInStr = interaction.fields.getTextInputValue('code_expires_in');

    const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : undefined;
    const expiresAt = expiresInStr ? new Date(Date.now() + parseInt(expiresInStr, 10) * 3600000) : undefined;

    const accessCode = await accessCodeService.createCode({
      guildId: interaction.guildId!,
      createdById: interaction.user.id,
      name,
      maxUses: isNaN(maxUses as number) ? undefined : maxUses,
      expiresAt: isNaN(expiresAt?.getTime() as number) ? undefined : expiresAt,
    });

    const embed = new EmbedBuilder()
      .setTitle('Access Code Generated')
      .setColor(Colors.SUCCESS)
      .addFields([
        { name: 'Name', value: accessCode.name, inline: true },
        { name: 'Code', value: `\`${accessCode.code}\``, inline: true },
        { name: 'Max Uses', value: accessCode.maxUses?.toString() || 'Unlimited', inline: true },
      ]);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(error);
    await interaction.editReply('An error occurred while generating the code.');
  }
};
