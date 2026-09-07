import { Guild, Channel, Role, ChannelType, GuildChannel } from 'discord.js';

export interface AuditReport {
  duplicateChannels: GuildChannel[];
  emptyChannels: GuildChannel[];
  duplicateRoles: Role[];
  unusedRoles: Role[];
  recommendations: string[];
  score: number;
}

export class ServerAuditService {
  async auditServer(guild: Guild): Promise<AuditReport> {
    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();
    
    const duplicateChannels: GuildChannel[] = [];
    const emptyChannels: GuildChannel[] = [];
    const duplicateRoles: Role[] = [];
    const unusedRoles: Role[] = [];
    const recommendations: string[] = [];
    
    const channelNames = new Set<string>();
    for (const [id, channel] of channels) {
      if (!channel || channel.type === ChannelType.GuildCategory) continue;
      
      const normalizedName = channel.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (channelNames.has(normalizedName)) {
        duplicateChannels.push(channel);
      } else {
        channelNames.add(normalizedName);
      }
      
      if (channel.isTextBased() && 'messages' in channel) {
        try {
          const messages = await channel.messages.fetch({ limit: 1 }).catch(() => null);
          if (!messages || messages.size === 0) {
            emptyChannels.push(channel as GuildChannel);
          }
        } catch {
          // ignore
        }
      }
    }
    
    const roleNames = new Set<string>();
    for (const [id, role] of roles) {
      if (role.name === '@everyone') continue;
      
      const normalizedName = role.name.toLowerCase();
      if (roleNames.has(normalizedName)) {
        duplicateRoles.push(role);
      } else {
        roleNames.add(normalizedName);
      }
      
      if (role.members.size === 0) {
        unusedRoles.push(role);
      }
    }
    
    let score = 100;
    if (duplicateChannels.length > 0) {
      score -= duplicateChannels.length * 2;
      recommendations.push(`Remove or rename ${duplicateChannels.length} duplicate channels.`);
    }
    if (emptyChannels.length > 0) {
      score -= emptyChannels.length;
      recommendations.push(`Consider archiving or deleting ${emptyChannels.length} empty channels.`);
    }
    if (duplicateRoles.length > 0) {
      score -= duplicateRoles.length * 2;
      recommendations.push(`Consolidate ${duplicateRoles.length} duplicate roles.`);
    }
    if (unusedRoles.length > 0) {
      score -= unusedRoles.length;
      recommendations.push(`Delete ${unusedRoles.length} unused roles.`);
    }
    
    score = Math.max(0, score);
    
    return {
      duplicateChannels,
      emptyChannels,
      duplicateRoles,
      unusedRoles,
      recommendations,
      score
    };
  }

  generateRecommendedStructure(): { categories: { name: string, channels: string[] }[] } {
    return {
      categories: [
        { name: 'VERIFICATION', channels: ['welcome', 'verify', 'verification-help'] },
        { name: 'INFORMATION', channels: ['rules', 'announcements', 'updates'] },
        { name: 'COMMUNITY', channels: ['general', 'gm', 'memes', 'introductions'] },
        { name: 'NFT', channels: ['mint-alerts', 'alpha', 'calls', 'discussions'] },
        { name: 'GAMES', channels: ['game-lobby', 'game-results', 'leaderboards'] },
        { name: 'SUPPORT', channels: ['tickets', 'reports'] },
        { name: 'STAFF', channels: ['staff-chat', 'mod-logs', 'audit-logs', 'bot-logs'] }
      ]
    };
  }
}

export const serverAuditService = new ServerAuditService();
