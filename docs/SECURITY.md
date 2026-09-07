# Security

## Data Collection
This bot **does not** collect personal data. It only stores Discord IDs, Guild IDs, and necessary metadata (XP, warnings, etc.) to function properly.

## Permission Model
- Sensitive commands (e.g., `/admin`) are protected by a permission guard middleware that checks for Discord Administrator permissions.
- Interaction handlers perform server-side verification before executing actions.
- Action rows and buttons for moderation tasks verify permissions on every click.

## Rate Limiting
- XP awards are rate-limited via an in-memory Map cooldown system.
- Daily challenges have a 24-hour cooldown enforced at the database level.

## Game Anti-Cheat
- Game logic is validated entirely server-side.
- Button interactions for games ensure that only the user who started the game can interact with the buttons.

## Raid Protection
- Configurable verification systems (Access Codes/Captcha) prevent automated bot joins.
- Audit logging tracks all significant member events.
