import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import {
  generateAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  clearRefreshTokenCookie,
} from '../lib/tokenService.js';

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const verified = await verifyRefreshToken(refreshToken);
    if (!verified) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ message: 'Refresh token invalide ou expiré' });
    }

    if (verified.userType === 'etudiant') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { id: verified.userId },
        select: { id: true, email: true, bloque: true },
      });
      if (!etudiant || etudiant.bloque) {
        clearRefreshTokenCookie(res);
        return res.status(403).json({ message: 'Compte introuvable ou bloqué' });
      }
      const accessToken = generateAccessToken({ id: etudiant.id, email: etudiant.email });
      return res.status(200).json({ accessToken, userType: 'etudiant' });
    }

    if (verified.userType === 'personnel') {
      const personnel = await prisma.personnel.findUnique({
        where: { id: verified.userId },
        select: { id: true, email: true, role: true, code: true, bloque: true },
      });
      if (!personnel || personnel.bloque) {
        clearRefreshTokenCookie(res);
        return res.status(403).json({ message: 'Compte introuvable ou bloqué' });
      }
      const accessToken = generateAccessToken({
        id: personnel.id, email: personnel.email, role: personnel.role, code: personnel.code,
      });
      return res.status(200).json({ accessToken, userType: 'personnel' });
    }

    return res.status(403).json({ message: 'Type utilisateur invalide' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
