import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';

export interface InteractionHandler {
  customId: string | RegExp;
  execute: (interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) => Promise<void>;
}

export interface CommandHandler {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface EventHandler {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void>;
}

export type GuildConfig = {
  id: string;
  guildId: string;
  prefix: string;
};

export type VerificationConfig = {
  captchaEnabled: boolean;
  minAccountAgeDays: number;
  requireScreening: boolean;
  waitingRoomEnabled: boolean;
  accessCodeRequired: boolean;
};

export type ModerationConfig = {
  spamThreshold: number;
  spamWindow: number;
  maxMentions: number;
  inviteLinkDetection: boolean;
  scamLinkDetection: boolean;
  capsThreshold: number;
  raidJoinThreshold: number;
  raidTimeWindow: number;
};
