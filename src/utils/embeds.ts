import { EmbedBuilder } from 'discord.js';
import { Colors } from '../config/constants';

export const createEmbed = (title: string, description: string, color: number = Colors.PRIMARY) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);
};

export const createSuccessEmbed = (description: string) => createEmbed('Success', description, Colors.SUCCESS);
export const createErrorEmbed = (description: string) => createEmbed('Error', description, Colors.ERROR);
