import { Interaction } from 'discord.js';
import { EventHandler } from '../types';
import { logger } from '../utils/logger';
import { createErrorEmbed } from '../utils/embeds';
import { Bot } from '../bot';

const event: EventHandler = {
  name: 'interactionCreate',
  once: false,
  execute: async (interaction: Interaction, bot: Bot) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = bot.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
      } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        const handler = bot.interactions.find((v, k) => {
          if (typeof k === 'string') return k === interaction.customId;
          if (k instanceof RegExp) return k.test(interaction.customId);
          return false;
        });

        if (!handler) {
          logger.warn(`No handler found for interaction: ${interaction.customId}`);
          if (interaction.isRepliable()) {
            await interaction.reply({ content: `⚙️ This feature (${interaction.customId}) is not yet connected.`, ephemeral: true }).catch(() => {});
          }
          return;
        }
        await handler.execute(interaction);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error handling interaction');
      try {
        if (interaction.isRepliable()) {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
          } else {
            await interaction.followUp({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
          }
        }
      } catch(e) { /* already handled */ }
    }
  }
};

export default event;
