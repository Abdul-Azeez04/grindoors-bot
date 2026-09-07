import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { requireAdmin } from '../middleware/permissionGuard';
import { createAdminPanel } from '../panels/AdminPanel';

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Open the admin dashboard');

export async function execute(interaction: ChatInputCommandInteraction) {
  await requireAdmin(interaction);
  
  const { embeds, components } = createAdminPanel();
  
  await interaction.reply({ 
    embeds, 
    components, 
    ephemeral: true 
  });
}
