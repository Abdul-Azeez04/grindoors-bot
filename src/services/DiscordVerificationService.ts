import { GuildMember } from 'discord.js';

export interface VerificationConfig {
  minAccountAgeDays: number;
  requireScreening: boolean;
}

export class DiscordVerificationService {
  checkMember(member: GuildMember, config: VerificationConfig): { passed: boolean, failures: string[] } {
    const failures: string[] = [];
    
    // Check account age
    const now = new Date();
    const createdAt = member.user.createdAt;
    const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageDays < config.minAccountAgeDays) {
      failures.push(`Account is too new. Minimum age required: ${config.minAccountAgeDays} days.`);
    }

    // Check screening
    if (config.requireScreening && member.pending) {
      failures.push(`You must complete the server's rules screening first.`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

export const discordVerificationService = new DiscordVerificationService();
