import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

export interface HybridRequest extends Request {
  personnel?: { id: number; email: string; role: string; code: string };
  etudiant?: { id: number; email: string };
}

export const verifyAnyToken = async (req: HybridRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const id = decoded['id'] as number;

    if (decoded['role']) {
      const personnel = await prisma.personnel.findUnique({ where: { id }, select: { bloque: true } });
      if (!personnel) return res.status(403).json({ message: 'Compte introuvable' });
      if (personnel.bloque) return res.status(403).json({ message: 'Compte bloqué' });
      req.personnel = decoded as { id: number; email: string; role: string; code: string };
    } else {
      const etudiant = await prisma.etudiant.findUnique({ where: { id }, select: { bloque: true } });
      if (!etudiant) return res.status(403).json({ message: 'Compte introuvable' });
      if (etudiant.bloque) return res.status(403).json({ message: 'Compte bloqué' });
      req.etudiant = decoded as { id: number; email: string };
    }

    next();
  } catch {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};
