import { NextResponse } from 'next/server';
import { sha256Hex } from '@/utils/auth/tokens';
import bcrypt from 'bcrypt';
import { prisma } from '@/utils/db';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    const tokenHash = await sha256Hex(token);

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or unknown token' }, { status: 400 });
    }

    if (tokenRecord.usedAt) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    }

    if (tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
