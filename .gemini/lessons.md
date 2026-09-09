# Lessons & Repository Patterns: GRINDOORS Discord Bot

## TypeScript & Discord.js Patterns
1. **Interaction Handlers & Return Types**:
   - With `noImplicitReturns: true`, never use `return interaction.reply(...)` in event/button handlers, as this returns `Promise<InteractionCallbackResponse | undefined>` while unhandled branches return `undefined`.
   - Always write `await interaction.reply(...); return;` and declare handlers with return type `Promise<void>`.

2. **Dynamic Interaction Exports**:
   - `Bot.loadInteractions` checks `interaction.customId || interaction.customIdRegex`.
   - Always provide an `export default { customId / customIdRegex, execute }` in every interaction file to ensure proper runtime mapping.

3. **Prisma Enums in Service Methods**:
   - Always cast or type input arguments to Prisma enums (e.g. `WarningSeverity`, `ModActionType`, `ReportCategory`, `ReportStatus`, `TicketCategory`, `TicketStatus`) rather than raw `string` to prevent runtime/schema mismatch.

4. **GameEngine Architecture**:
   - All 24 mini-game classes inherit from `GameEngine` with constructor `(guildId: string, channelId: string)`.
   - `createQuestionEmbed()` returns `{ embed: EmbedBuilder, components: ActionRowBuilder<any>[] }`.
   - Button custom IDs must adhere to `game_ans_*` so `gameButtons.ts` routes them seamlessly to `GameEngine.handleAnswer()`.
