# GRINDOORS Discord Bot

A modular, production-ready Discord bot built with TypeScript, discord.js v14, and Prisma for the **GRINDOORS** NFT grinder/trader community.

## Features
- **🔐 Secure Gatekeeper**: CAPTCHA verification, access codes, waiting room
- **🛡 Moderation**: Anti-spam, scam-link detection, raid protection, warning escalation
- **🎮 24 Community Games**: Flag Guess, NFT Trivia, Rumble, Scam or Legit, and more
- **🏆 XP & Leveling**: 8 rank tiers from Fresh Wallet to Legend
- **💎 Mint Board**: NFT mint calendar with scheduled alerts
- **☀️ Daily GM**: Automated daily messages with quotes
- **🎫 Ticket System**: Button-driven support with categories
- **🎛 Admin Dashboard**: Full server management from one panel
- **📊 Analytics & Leaderboards**: Track community engagement

## Tech Stack
- Node.js & TypeScript
- discord.js v14
- PostgreSQL & Prisma ORM
- Redis & BullMQ
- Pino (Logging)
- Docker

## Quick Start

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Start services and deploy:
```bash
docker-compose up -d
npx prisma generate
npx prisma db push
npm run deploy:commands
npm run dev
```

4. In your Discord server, type `/admin` and click **Quick Setup** to deploy the full server structure.

## Documentation
- [Setup Guide](docs/SETUP.md)
- [Admin Guide](docs/ADMIN_GUIDE.md)
- [Security](docs/SECURITY.md)
- [Permissions](docs/PERMISSIONS.md)

## License
MIT License
