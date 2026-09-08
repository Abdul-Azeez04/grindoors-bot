import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { createAdminPanel } from '../panels/AdminPanel';

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Open the admin dashboard');

export async function execute(interaction: ChatInputCommandInteraction) {
  // Check admin permissions
  if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && 
      !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
    await interaction.reply({ content: '❌ You need Administrator or Manage Server permissions to use this.', ephemeral: true });
    return;
  }

  try {
    const { embeds, components } = createAdminPanel();
    await interaction.reply({ embeds, components, ephemeral: true });
  } catch (error) {
    await interaction.reply({ content: '❌ Failed to create admin panel.', ephemeral: true });
  }
  return;
}
