# Persistent Memory: GRINDOORS Discord Bot

## System Architecture
- **Framework**: Discord.js v14 + TypeScript + Prisma ORM (PostgreSQL) + BullMQ / Redis.
- **Core Modules**:
  - `Verification/Gatekeeper`: Math CAPTCHA + Access Code + Multi-tier Role assignment.
  - `Admin Panels & Modals`: Server setup, channel/category builder, audit reports, moderation suite.
  - `24 Mini-Games`: Unified `GameEngine` lifecycle, dynamic embed + button interface, automated XP scoring & database leaderboards.
  - `XP & Leveling System`: 15-25 XP per chat message (with 60s cooldown), level progression formula, streak rewards.
  - `Support Tickets`: Category selection menu, permission-overwritten private channels, claim/escalate/close flows.
  - `Mint Board & Daily GM`: Upcoming NFT mint countdowns, daily quote generation, streak tracker.
  - `Scheduler`: BullMQ workers for recurring mint alerts, daily GM announcements, and role rotations.

## Status
- **Current State**: Codebase fully audited, all 24 games and interaction handlers standardized and deconflicted, zero TypeScript compiler errors (`npx tsc --noEmit` & `npm run build` pass with code 0).
