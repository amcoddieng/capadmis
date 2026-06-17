import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

export interface PersonnelRequest extends Request {
  personnel?: { id: number; email: string; role: string; code: string };
}

export const verifyPersonnelToken = async (req: PersonnelRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PersonnelRequest['personnel'];
    const personnel = await prisma.personnel.findUnique({
      where: { id: decoded!.id },
      select: { bloque: true },
    });
    if (!personnel) return res.status(403).json({ message: 'Compte introuvable' });
    if (personnel.bloque) return res.status(403).json({ message: 'Compte bloqué' });
    req.personnel = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

export const requireSuperAdmin = (req: PersonnelRequest, res: Response, next: NextFunction) => {
  if (req.personnel?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Accès refusé : réservé au superadmin' });
  }
  next();
};

export const requireSuperAdminOrAdmin = (req: PersonnelRequest, res: Response, next: NextFunction) => {
  const role = req.personnel?.role;
  if (role !== 'superadmin' && role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé : réservé aux admins et superadmins' });
  }
  next();
};
