import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from "../database/client";
import { Colors } from '../config/constants';

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Verify your account to gain access to the server');

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    return;
  }

  try {
    const member = await prisma.member.findUnique({
      where: { discordId_guildId: { discordId: interaction.user.id, guildId: interaction.guildId } }
    });

    if (member?.verificationStatus === 'VERIFIED') {
      await interaction.reply({ content: 'You are already verified!', ephemeral: true });
      return;
    }
  } catch (e) {
    // Table might not exist yet, proceed with verification anyway
  }

  const embed = new EmbedBuilder()
    .setTitle('Verification Required')
    .setDescription('Please click the button below to verify your account.')
    .setColor(Colors.PRIMARY);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('hub_verify').setLabel('Verify Now').setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  return;
}
