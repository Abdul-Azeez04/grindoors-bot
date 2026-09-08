import { prisma } from '../database/client';

export class VerificationService {
  async startVerification(guildId: string, discordId: string, username: string = 'Unknown'): Promise<void> {
    await prisma.member.upsert({
      where: { discordId_guildId: { guildId, discordId } },
      update: { verificationStatus: 'UNVERIFIED' },
      create: { guildId, discordId, username, verificationStatus: 'UNVERIFIED', joinedAt: new Date() }
    });
  }

  async completeCaptcha(guildId: string, discordId: string): Promise<void> {
    await prisma.member.update({
      where: { discordId_guildId: { guildId, discordId } },
      data: { verificationStatus: 'CAPTCHA_PASSED' }
    });
  }

  async moveToWaitingRoom(guildId: string, discordId: string): Promise<void> {
    await prisma.member.update({
      where: { discordId_guildId: { guildId, discordId } },
      data: { verificationStatus: 'WAITING_ROOM' }
    });
  }

  async completeVerification(guildId: string, discordId: string): Promise<void> {
    await prisma.member.update({
      where: { discordId_guildId: { guildId, discordId } },
      data: { verificationStatus: 'VERIFIED', verifiedAt: new Date() }
    });
  }

  async getMemberStatus(guildId: string, discordId: string) {
    return await prisma.member.findUnique({
      where: { discordId_guildId: { guildId, discordId } }
    });
  }
}

export const verificationService = new VerificationService();
