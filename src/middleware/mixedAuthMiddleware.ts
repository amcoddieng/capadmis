import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

export interface MixedRequest extends Request {
  etudiant?: { id: number; email: string };
  personnel?: { id: number; email: string; role: string; code: string };
}

export const verifyEtudiantOrPersonnelToken = async (req: MixedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: decoded.id },
      select: { bloque: true },
    });
    if (etudiant && !etudiant.bloque) {
      req.etudiant = decoded;
      return next();
    }
  } catch {
    // Not a valid student token
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; code: string };
    const personnel = await prisma.personnel.findUnique({
      where: { id: decoded.id },
      select: { bloque: true },
    });
    if (personnel && !personnel.bloque) {
      req.personnel = decoded;
      return next();
    }
  } catch {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }

  return res.status(403).json({ message: 'Token invalide ou expiré' });
};
