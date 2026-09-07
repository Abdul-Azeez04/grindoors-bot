import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { logger } from "./utils/logger";
import * as verifyCommand from './commands/verify';
import * as helpCommand from './commands/help';
import * as profileCommand from './commands/profile';
import * as adminCommand from './commands/admin';

config();

const commands = [
  verifyCommand.data.toJSON(),
  helpCommand.data.toJSON(),
  profileCommand.data.toJSON(),
  adminCommand.data.toJSON()
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    logger.info(`Successfully reloaded ${(data as any).length} application (/) commands.`);
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
