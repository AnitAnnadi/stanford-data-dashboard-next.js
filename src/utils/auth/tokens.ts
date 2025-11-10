// lib/auth/tokens.ts
import 'server-only';
import { prisma } from '@/utils/db';

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');

export async function createPasswordResetToken(userId: string, ttlMs = 60 * 60 * 1000) {
  // single active token per user (optional)
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const rawBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawToken = Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  const tokenHash = toHex(digest);
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  return { rawToken, expiresAt };
}

export async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return toHex(digest);
}
