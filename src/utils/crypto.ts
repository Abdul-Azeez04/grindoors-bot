import crypto from 'crypto';

export function generateAccessCode(): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `GRIND-${segment()}-${segment()}`;
}

export function generateSecureRandom(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
