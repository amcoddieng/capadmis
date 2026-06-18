import jwt from 'jsonwebtoken';
import { Response } from 'express';
import prisma from './prisma.js';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'votre_refresh_secrete_par_defaut';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const COOKIE_NAME = 'refresh_token';
const IS_PROD = process.env.NODE_ENV === 'production';

export function generateAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export async function createRefreshToken(userId: number, userType: 'etudiant' | 'personnel'): Promise<string> {
  const token = jwt.sign(
    { sub: userId, type: userType, jti: randomUUID() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS);

  await prisma.refresh_token.create({
    data: { token, user_id: userId, user_type: userType, expiresAt },
  });

  return token;
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: REFRESH_EXPIRY_MS,
    path: '/',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/',
  });
}

export async function verifyRefreshToken(token: string): Promise<{ userId: number; userType: 'etudiant' | 'personnel' } | null> {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, { clockTolerance: 60 }) as unknown as {
      sub: number;
      type: string;
      jti?: string;
    };

    const stored = await prisma.refresh_token.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return null;
    }

    if (stored.user_type !== decoded.type || stored.user_id !== decoded.sub) {
      return null;
    }

    return { userId: decoded.sub, userType: decoded.type as 'etudiant' | 'personnel' };
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refresh_token.deleteMany({ where: { token } });
}

export async function revokeAllUserRefreshTokens(userId: number, userType: 'etudiant' | 'personnel'): Promise<void> {
  await prisma.refresh_token.deleteMany({ where: { user_id: userId, user_type: userType } });
}
