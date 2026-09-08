const https = require('https');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const commands = [
  { name: 'verify', description: 'Verify your account to gain access to the server' },
  { name: 'help', description: 'Show bot commands and information' },
  { name: 'profile', description: 'View your profile and stats' },
  { name: 'admin', description: 'Open the admin dashboard' }
];

const token = env.DISCORD_TOKEN;
const clientId = env.DISCORD_CLIENT_ID;

const data = JSON.stringify(commands);

const options = {
  hostname: 'discord.com',
  path: `/api/v10/applications/${clientId}/commands`,
  method: 'PUT',
  headers: {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('Successfully reloaded 4 application (/) commands.');
    } else {
      console.log('Body:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
