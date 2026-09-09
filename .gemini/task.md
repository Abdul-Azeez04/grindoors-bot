# Task: Complete Audit, Fixes, and End-to-End Verification of GRINDOORS Bot

- [x] 1. Dependencies & Tooling Setup <!-- id: 0 -->
    - [x] Run `npm install` to install all project dependencies <!-- id: 1 -->
    - [x] Run `npx prisma generate` to generate the Prisma client <!-- id: 2 -->
- [x] 2. Fix Game Engine & Standardize All 24 Community Games <!-- id: 3 -->
    - [x] Standardize `GameEngine` constructor and return types across all 24 games <!-- id: 4 -->
    - [x] Standardize button custom IDs to `game_ans_*` and update `gameButtons.ts` handler <!-- id: 5 -->
    - [x] Fix `gameSelect.ts` instantiation to match constructor signatures <!-- id: 6 -->
- [x] 3. Fix Interaction Router & Eliminate Regex Collisions <!-- id: 7 -->
    - [x] Harmonize `adminDashboard.ts` and `serverManagement.ts` <!-- id: 8 -->
    - [x] Harmonize `gmButtons.ts` and `mintButtons.ts` routing <!-- id: 9 -->
- [x] 4. Fix Moderation Modals & Ticket Channel Reference <!-- id: 10 -->
    - [x] Fix `moderationModals.ts` to read `target_id` from modal inputs <!-- id: 11 -->
    - [x] Fix `hubButtons.ts` ticket creation destructuring <!-- id: 12 -->
- [x] 5. Wire Up Scheduler Workers & Background Jobs <!-- id: 13 -->
    - [x] Fix imports in `dailyGM.ts`, `dailyRoleRotation.ts`, and `mintAlerts.ts` <!-- id: 14 -->
    - [x] Initialize BullMQ workers in `bot.ts` <!-- id: 15 -->
- [x] 6. Hook Up Chat XP & Daily GM in `messageCreate` <!-- id: 16 -->
    - [x] Award XP on regular messages in `messageCreate.ts` with cooldown <!-- id: 17 -->
    - [x] Detect GM channel / messages for streak updates <!-- id: 18 -->
- [x] 7. Verification & TypeScript Build <!-- id: 19 -->
    - [x] Run `npx tsc --noEmit` and achieve 0 type errors <!-- id: 20 -->
    - [x] Validate runtime readiness via `npm run build` <!-- id: 21 -->

## Review & Audit Summary
- **Type Safety**: Passed `npx tsc --noEmit` and `npm run build` with 0 errors.
- **24 Mini-Games**: Unified game lifecycle, dynamic embeds, button actions, and XP score tracking in `GameEngine.ts` and individual game classes.
- **Interactions & Modals**: Fully aligned all customId regexes, fixed modal text field retrieval, mapped action logging parameter orders, and typed all service callbacks with Prisma database enums.
- **Scheduler & Background Workers**: Standardized `bot.client` references across all background jobs with resilient graceful startup in `bot.ts`.
- **Events**: Integrated chat message XP reward with anti-spam cooldown, leveled-up notifications, and daily GM streak updates in `src/events/messageCreate.ts`.
