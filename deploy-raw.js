const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'verify',
    description: 'Verify your account to gain access to the server'
  },
  {
    name: 'help',
    description: 'Show bot commands and information'
  },
  {
    name: 'profile',
    description: 'View your profile and stats'
  },
  {
    name: 'admin',
    description: 'Open the admin dashboard'
  }
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
