import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Colors } from '../config/constants';

export function createVerificationPanel() {
  const embed = new EmbedBuilder()
    .setTitle('🔐 VERIFICATION')
    .setDescription('Welcome! To gain access to the rest of the server, please complete the verification process.')
    .setColor(Colors.DARK)
    .addFields([
      { name: 'Step 1', value: 'Click the VERIFY ACCOUNT button and solve the CAPTCHA.' },
      { name: 'Step 2', value: 'If required, click ENTER ACCESS CODE to submit your invite code.' }
    ]);

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_start')
      .setLabel('🔐 VERIFY ACCOUNT')
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_access_code')
      .setLabel('🎟️ ENTER ACCESS CODE')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
}
