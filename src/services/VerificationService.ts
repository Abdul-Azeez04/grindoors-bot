import { prisma } from '../database/client';

export class VerificationService {
  async startVerification(guildId: string, userId: string): Promise<void> {
    await prisma.member.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: { status: 'UNVERIFIED' },
      create: { guildId, userId, status: 'UNVERIFIED' }
    });
  }

  async completeCaptcha(guildId: string, userId: string): Promise<void> {
    await prisma.member.update({
      where: { guildId_userId: { guildId, userId } },
      data: { status: 'CAPTCHA_PASSED' }
    });
  }

  async moveToWaitingRoom(guildId: string, userId: string): Promise<void> {
    await prisma.member.update({
      where: { guildId_userId: { guildId, userId } },
      data: { status: 'WAITING_ROOM' }
    });
  }

  async completeVerification(guildId: string, userId: string): Promise<void> {
    await prisma.member.update({
      where: { guildId_userId: { guildId, userId } },
      data: { status: 'VERIFIED', verifiedAt: new Date() }
    });
  }

  async getMemberStatus(guildId: string, userId: string) {
    return await prisma.member.findUnique({
      where: { guildId_userId: { guildId, userId } }
    });
  }
}

export const verificationService = new VerificationService();
