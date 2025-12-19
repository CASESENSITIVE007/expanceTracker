import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getUserFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value || null;
}

export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}
