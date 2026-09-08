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

        if (!handler) return;
        await handler.execute(interaction);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error handling interaction');
      const embed = createErrorEmbed('An unexpected error occurred while executing this command.');
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
      } else if (interaction.isRepliable() && interaction.replied) {
        await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
      }
    }
  }
};

export default event;
