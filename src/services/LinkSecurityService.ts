export class LinkSecurityService {
  private static phishingDomains = ['discorcl.com', 'dlscord.gg', 'discord-nitro.com'];
  private static suspiciousTLDs = ['.xyz', .tk, .ml];

  static checkMessage(content: string): { isSuspicious: boolean, reasons: string[], severity: 'low' | 'medium' | 'high' } {
    const reasons: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    let isSuspicious = false;

    const urls = content.match(/https?:\/\/[^\s]+/g) || [];

    for (const url of urls) {
      if (this.isDiscordInvite(url)) {
        isSuspicious = true;
        reasons.push('Discord invite link');
        severity = 'medium';
      }

      if (this.isPhishingDomain(url)) {
        isSuspicious = true;
        reasons.push('Known phishing domain');
        severity = 'high';
      }

      for (const tld of this.suspiciousTLDs) {
        if (url.includes(tld)) {
          isSuspicious = true;
          reasons.push(`Suspicious TLD (${tld})`);
          if (severity === 'low') severity = 'medium';
        }
      }
    }

    const lowerContent = content.toLowerCase();
    if (urls.length > 0 && (lowerContent.includes('free mint') || lowerContent.includes('claim airdrop') || lowerContent.includes('connect wallet'))) {
      isSuspicious = true;
      reasons.push('Crypto scam keywords with links');
      severity = 'high';
    }

    return { isSuspicious, reasons, severity };
  }

  static isDiscordInvite(url: string): boolean {
    return url.includes('discord.gg/') || url.includes('discord.com/invite/');
  }

  static isPhishingDomain(url: string): boolean {
    return this.phishingDomains.some(domain => url.includes(domain));
  }
}
