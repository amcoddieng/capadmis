import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { Role } from '@prisma/client';
import {
  generateAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  revokeAllUserRefreshTokens,
} from '../lib/tokenService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

const CONSEILLER_ROLES: Role[] = ['conseiller_visa', 'conseiller_admission'];
const ALLOWED_ROLES: Role[] = ['admin', ...CONSEILLER_ROLES];

const SAFE_SELECT = {
  id: true, prenom: true, nom: true, code: true,
  email: true, role: true, bloque: true, createdAt: true,
} as const;

async function generateUniqueCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let exists: boolean;
  do {
    code = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    const found = await prisma.personnel.findUnique({ where: { code } });
    exists = found !== null;
  } while (exists);
  return code;
}

export const createPersonnel = async (req: Request & { personnel?: { role: string } }, res: Response) => {
  try {
    const callerRole = req.personnel?.role;
    const { prenom, nom, email, mdp, role } = req.body as {
      prenom: string; nom: string; email: string; mdp: string; role: Role;
    };

    if (!prenom || !nom || !email || !mdp || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis : prenom, nom, email, mdp, role' });
    }

    const rolesAllowedForCaller = callerRole === 'superadmin' ? ALLOWED_ROLES : CONSEILLER_ROLES;
    if (!rolesAllowedForCaller.includes(role)) {
      return res.status(400).json({
        message: `Rôle invalide. Valeurs autorisées pour votre niveau : ${rolesAllowedForCaller.join(', ')}`,
      });
    }

    const existing = await prisma.personnel.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const code = await generateUniqueCode();
    const hashedPassword = await bcrypt.hash(mdp, 10);

    const personnel = await prisma.personnel.create({
      data: { prenom, nom, code, email, mdp: hashedPassword, role },
      select: SAFE_SELECT,
    });

    return res.status(201).json({ message: 'Personnel créé avec succès', personnel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updatePersonnelById = async (req: Request & { personnel?: { role: string } }, res: Response) => {
  try {
    const callerRole = req.personnel?.role;
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const target = await prisma.personnel.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Personnel introuvable' });

    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Impossible de modifier un superadmin' });
    }
    if (target.role === 'admin' && callerRole !== 'superadmin') {
      return res.status(403).json({ message: 'Seul le superadmin peut modifier un admin' });
    }

    const { prenom, nom, email, mdp } = req.body as {
      prenom?: string; nom?: string; email?: string; mdp?: string;
    };

    const data: Record<string, unknown> = {};
    if (prenom) data.prenom = prenom;
    if (nom) data.nom = nom;
    if (email) data.email = email;
    if (mdp) data.mdp = await bcrypt.hash(mdp, 10);

    const updated = await prisma.personnel.update({ where: { id }, data, select: SAFE_SELECT });
    return res.status(200).json({ message: 'Personnel mis à jour', personnel: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deletePersonnelById = async (req: Request & { personnel?: { role: string } }, res: Response) => {
  try {
    const callerRole = req.personnel?.role;
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const target = await prisma.personnel.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Personnel introuvable' });

    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Impossible de supprimer un superadmin' });
    }
    if (target.role === 'admin' && callerRole !== 'superadmin') {
      return res.status(403).json({ message: 'Seul le superadmin peut supprimer un admin' });
    }

    await prisma.personnel.delete({ where: { id } });
    return res.status(200).json({ message: 'Personnel supprimé avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const bloquerPersonnel = async (req: Request & { personnel?: { role: string } }, res: Response) => {
  try {
    const callerRole = req.personnel?.role;
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const target = await prisma.personnel.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Personnel introuvable' });

    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Impossible de bloquer un superadmin' });
    }
    if (target.role === 'admin' && callerRole !== 'superadmin') {
      return res.status(403).json({ message: 'Seul le superadmin peut bloquer un admin' });
    }

    const bloque = !target.bloque;
    const updated = await prisma.personnel.update({ where: { id }, data: { bloque }, select: SAFE_SELECT });
    return res.status(200).json({
      message: bloque ? 'Personnel bloqué' : 'Personnel débloqué',
      personnel: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const loginPersonnel = async (req: Request, res: Response) => {
  try {
    const { email, mdp } = req.body as { email: string; mdp: string };

    if (!email || !mdp) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const personnel = await prisma.personnel.findUnique({ where: { email } });
    if (!personnel) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (personnel.bloque) {
      return res.status(403).json({ message: 'Votre compte est bloqué' });
    }

    const isMatch = await bcrypt.compare(mdp, personnel.mdp);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    await revokeAllUserRefreshTokens(personnel.id, 'personnel');

    const accessToken = generateAccessToken({
      id: personnel.id, email: personnel.email, role: personnel.role, code: personnel.code,
    });
    const refreshToken = await createRefreshToken(personnel.id, 'personnel');
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Connexion réussie',
      accessToken,
      personnel: {
        id: personnel.id,
        prenom: personnel.prenom,
        nom: personnel.nom,
        code: personnel.code,
        email: personnel.email,
        role: personnel.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateSelfPersonnel = async (req: Request & { personnel?: { id: number; role: string } }, res: Response) => {
  try {
    const id = req.personnel?.id;
    if (!id) return res.status(401).json({ message: 'Non authentifié' });

    const target = await prisma.personnel.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Personnel introuvable' });
    if (target.bloque) return res.status(403).json({ message: 'Compte bloqué' });

    const { prenom, nom, mdp, mdp_actuel } = req.body as {
      prenom?: string; nom?: string; mdp?: string; mdp_actuel?: string;
    };

    const data: Record<string, unknown> = {};
    if (prenom) data.prenom = prenom;
    if (nom) data.nom = nom;

    if (mdp) {
      if (!mdp_actuel) {
        return res.status(400).json({ message: 'mdp_actuel est requis pour changer le mot de passe' });
      }
      const isMatch = await bcrypt.compare(mdp_actuel, target.mdp);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }
      if (mdp.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      }
      data.mdp = await bcrypt.hash(mdp, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Au moins un champ à modifier est requis' });
    }

    const updated = await prisma.personnel.update({ where: { id }, data, select: SAFE_SELECT });
    return res.status(200).json({ message: 'Profil mis à jour', personnel: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const listerPersonnelPourSuperAdmin = async (_req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.findMany({
      where: { role: { not: 'superadmin' } },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ personnel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const listerConseillersPourAdmin = async (_req: Request, res: Response) => {
  try {
    const conseillers = await prisma.personnel.findMany({
      where: { role: { in: CONSEILLER_ROLES } },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ conseillers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
