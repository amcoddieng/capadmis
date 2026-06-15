import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

export interface HybridRequest extends Request {
  personnel?: { id: number; email: string; role: string; code: string };
  etudiant?: { id: number; email: string };
}

export const verifyAnyToken = (req: HybridRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded['role']) {
      req.personnel = decoded as { id: number; email: string; role: string; code: string };
    } else {
      req.etudiant = decoded as { id: number; email: string };
    }
    next();
  } catch {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};
