import { prisma } from '../database/client';
import { generateAccessCode } from '../utils/crypto';

export class AccessCodeService {
  async createCode(options: { guildId: string, createdById: string, name: string, maxUses?: number, expiresAt?: Date, roleId?: string, notes?: string }) {
    const code = generateAccessCode();
    return await prisma.accessCode.create({
      data: {
        guildId: options.guildId,
        createdById: options.createdById,
        name: options.name,
        code,
        maxUses: options.maxUses,
        expiresAt: options.expiresAt,
        roleId: options.roleId,
        notes: options.notes,
        active: true,
        currentUses: 0
      }
    });
  }

  async validateCode(guildId: string, code: string, userId: string) {
    const accessCode = await prisma.accessCode.findFirst({
      where: { guildId, code, active: true }
    });

    if (!accessCode) {
      return { valid: false, error: 'Invalid or expired access code.' };
    }

    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      return { valid: false, error: 'Invalid or expired access code.' };
    }

    if (accessCode.maxUses !== null && accessCode.currentUses >= accessCode.maxUses) {
      return { valid: false, error: 'Invalid or expired access code.' };
    }

    return { valid: true, accessCode };
  }

  async useCode(codeId: number, memberId: string): Promise<void> {
    await prisma.$transaction([
      prisma.accessCode.update({
        where: { id: codeId },
        data: { currentUses: { increment: 1 } }
      }),
      prisma.accessCodeUsage.create({
        data: { accessCodeId: codeId, userId: memberId }
      })
    ]);
  }

  async getActiveCodes(guildId: string) {
    return await prisma.accessCode.findMany({
      where: { guildId, active: true }
    });
  }

  async disableCode(codeId: number): Promise<void> {
    await prisma.accessCode.update({
      where: { id: codeId },
      data: { active: false }
    });
  }

  async getCodeUsage(codeId: number) {
    return await prisma.accessCodeUsage.findMany({
      where: { accessCodeId: codeId },
      include: { user: true }
    });
  }

  async regenerateCode(codeId: number) {
    const newCode = generateAccessCode();
    return await prisma.accessCode.update({
      where: { id: codeId },
      data: { code: newCode }
    });
  }
}

export const accessCodeService = new AccessCodeService();
