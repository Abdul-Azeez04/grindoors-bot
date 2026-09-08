import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { env } from './config/environment';
import { logger } from './utils/logger';
import * as path from 'path';
import * as fs from 'fs';
import { CommandHandler, EventHandler, InteractionHandler } from './types';

export class Bot {
  public client: Client;
  public commands: Collection<string, CommandHandler>;
  public interactions: Collection<string | RegExp, InteractionHandler>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
    this.commands = new Collection();
    this.interactions = new Collection();
  }

  public async loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    if (!fs.existsSync(eventsPath)) return;
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of eventFiles) {
      const event: EventHandler = (await import(path.join(eventsPath, file))).default;
      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args, this));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args, this));
      }
    }
    logger.info(`Loaded ${eventFiles.length} events`);
  }

  public async loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsPath)) return;
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of commandFiles) {
      let command: any = await import(path.join(commandsPath, file));
      if (command.default) command = command.default;
      
      if (command.data && command.data.name) {
        this.commands.set(command.data.name, command as CommandHandler);
      } else {
        logger.warn(`Command file ${file} is missing 'data' export.`);
      }
    }
    logger.info(`Loaded ${this.commands.size} commands`);
  }

  public async loadInteractions() {
    const interactionsPath = path.join(__dirname, 'interactions');
    if (!fs.existsSync(interactionsPath)) return;
    const folders = ['buttons', 'selectMenus', 'modals'];
    
    for (const folder of folders) {
      const folderPath = path.join(interactionsPath, folder);
      if (!fs.existsSync(folderPath)) continue;
      
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
      for (const file of files) {
        let interaction: any = await import(path.join(folderPath, file));
        if (interaction.default) interaction = interaction.default;

        const id = interaction.customId || interaction.customIdRegex;
        if (id) {
          this.interactions.set(id, interaction as InteractionHandler);
        } else {
          // If it's a generic handler like handleHubButton, we can't map it directly here.
          // We will store it with the filename just so it's loaded, but interactionCreate might need custom logic.
          logger.warn(`Interaction file ${file} is missing 'customId' export.`);
        }
      }
    }
    logger.info(`Loaded ${this.interactions.size} mapped interactions`);
  }

  public async start() {
    await this.loadEvents();
    await this.loadCommands();
    await this.loadInteractions();
    
    try {
      await this.client.login(env.DISCORD_TOKEN);
      logger.info('Bot is connecting to Discord...');
    } catch (error) {
      logger.error({ err: error }, 'Failed to login to Discord');
    }
  }
}
