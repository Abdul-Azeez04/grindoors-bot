# Bot Setup Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Discord Account

## 1. Discord Developer Portal Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new Application
3. Go to the "Bot" tab and click "Add Bot"
4. Enable the following Privileged Gateway Intents:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
5. Copy the Bot Token
6. Go to OAuth2 -> URL Generator
7. Select `bot` and `applications.commands` scopes
8. Select required permissions (Administrator recommended for full functionality)
9. Copy the generated URL and invite the bot to your server

## 2. Environment Configuration
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Fill in the variables:
   - `DISCORD_TOKEN`: Your bot token
   - `DISCORD_CLIENT_ID`: Your application ID
   - `DATABASE_URL`: PostgreSQL connection string

## 3. Starting the Services
Run the following commands:
```bash
# Start the database and redis
docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Deploy slash commands
npm run deploy:commands

# Start the bot in dev mode
npm run dev
```

## 4. Production Deployment
For production, you can use Docker or services like Railway/Render.
Make sure to build the project first: `npm run build` then `npm start`.
