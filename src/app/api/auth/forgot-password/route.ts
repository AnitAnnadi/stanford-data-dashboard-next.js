import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { sendPasswordResetEmail } from '@/utils/auth/reset-email';
import { createPasswordResetToken } from '@/utils/auth/tokens';
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a reset link has been sent.',
      });
    }

    const { rawToken } = await createPasswordResetToken(user.id);

    await sendPasswordResetEmail(email, rawToken);

    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
