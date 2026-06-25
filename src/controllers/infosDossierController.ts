import { Response } from 'express';
import { StatusInfosDossier } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { HybridRequest } from '../middleware/hybridMiddleware.js';

const INFOS_SELECT = {
  id: true,
  code_dossier: true,
  niveau_etude: true,
  pays_souhaite: true,
  filieres: true,
  nombre_fois_bac: true,
  serie_bac: true,
  formation_en_cours: true,
  paiement: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function resolveCallerAccess(
  req: HybridRequest,
  code_dossier: string
): Promise<{ allowed: boolean; forceEnAttente: boolean; reason?: string }> {
  const personnel = req.personnel;
  const etudiant = req.etudiant;

  if (!personnel && !etudiant) {
    return { allowed: false, forceEnAttente: false, reason: 'Non authentifié' };
  }

  if (etudiant) {
    const dossier = await prisma.dossier.findUnique({
      where: { etudiant_id: etudiant.id },
      select: { code_dossier: true },
    });
    if (!dossier || dossier.code_dossier !== code_dossier) {
      return { allowed: false, forceEnAttente: false, reason: 'Ce dossier ne vous appartient pas' };
    }
    return { allowed: true, forceEnAttente: true };
  }

  const role = personnel!.role;
  if (role === 'superadmin' || role === 'admin') {
    return { allowed: true, forceEnAttente: false };
  }

  if (role === 'conseiller_admission' || role === 'conseiller_visa') {
    const dossier = await prisma.dossier.findUnique({
      where: { code_dossier },
      select: { conseiller_admission_id: true, conseiller_visa_id: true },
    });
    if (!dossier) return { allowed: false, forceEnAttente: false, reason: 'Dossier introuvable' };

    const isAssigned =
      (role === 'conseiller_admission' && dossier.conseiller_admission_id === personnel!.id) ||
      (role === 'conseiller_visa' && dossier.conseiller_visa_id === personnel!.id);

    if (!isAssigned) {
      return { allowed: false, forceEnAttente: false, reason: 'Vous n\'êtes pas assigné à ce dossier' };
    }
    return { allowed: true, forceEnAttente: false };
  }

  return { allowed: false, forceEnAttente: false, reason: 'Accès refusé' };
}

export const creerInfosDossier = async (req: HybridRequest, res: Response) => {
  try {
    const { code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac, serie_bac, formation_en_cours, paiement, status } = req.body as {
      code_dossier: string;
      niveau_etude: string;
      pays_souhaite: string;
      filieres: string[];
      nombre_fois_bac: number;
      serie_bac: string;
      formation_en_cours: string;
      paiement?: boolean;
      status?: StatusInfosDossier;
    };

    if (!code_dossier || !niveau_etude || !pays_souhaite || !filieres?.length || nombre_fois_bac === undefined || !serie_bac || !formation_en_cours) {
      return res.status(400).json({ message: 'Champs requis : code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac, serie_bac, formation_en_cours' });
    }

    const { allowed, forceEnAttente, reason } = await resolveCallerAccess(req, code_dossier);
    if (!allowed) return res.status(403).json({ message: reason });

    const existing = await prisma.infos_dossier.findUnique({ where: { code_dossier } });
    if (existing) return res.status(409).json({ message: 'Des infos existent déjà pour ce dossier, utilisez la modification' });

    const finalStatus: StatusInfosDossier = forceEnAttente ? 'EN_ATTENTE' : (status ?? 'EN_ATTENTE');

    const infos = await prisma.infos_dossier.create({
      data: { code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac: Number(nombre_fois_bac), serie_bac, formation_en_cours, ...(paiement !== undefined ? { paiement } : {}), status: finalStatus },
      select: INFOS_SELECT,
    });

    return res.status(201).json({ message: 'Infos dossier créées avec succès', infos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const modifierInfosDossier = async (req: HybridRequest, res: Response) => {
  try {
    const { code_dossier } = req.params as { code_dossier: string };

    const existing = await prisma.infos_dossier.findUnique({ where: { code_dossier } });
    if (!existing) return res.status(404).json({ message: 'Infos dossier introuvables' });

    const { allowed, forceEnAttente, reason } = await resolveCallerAccess(req, code_dossier);
    if (!allowed) return res.status(403).json({ message: reason });

    const { niveau_etude, pays_souhaite, filieres, nombre_fois_bac, serie_bac, formation_en_cours, paiement, status } = req.body as {
      niveau_etude?: string;
      pays_souhaite?: string;
      filieres?: string[];
      nombre_fois_bac?: number;
      serie_bac?: string;
      formation_en_cours?: string;
      paiement?: boolean;
      status?: StatusInfosDossier;
    };

    const VALID_STATUS: StatusInfosDossier[] = ['VALIDE', 'EN_ATTENTE', 'INVALIDE'];
    if (status && !forceEnAttente && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: `status invalide. Valeurs : ${VALID_STATUS.join(', ')}` });
    }

    const data: Record<string, unknown> = {};
    if (niveau_etude !== undefined) data.niveau_etude = niveau_etude;
    if (pays_souhaite !== undefined) data.pays_souhaite = pays_souhaite;
    if (filieres !== undefined) data.filieres = filieres;
    if (nombre_fois_bac !== undefined) data.nombre_fois_bac = Number(nombre_fois_bac);
    if (serie_bac !== undefined) data.serie_bac = serie_bac;
    if (formation_en_cours !== undefined) data.formation_en_cours = formation_en_cours;
    if (paiement !== undefined) data.paiement = paiement;
    data.status = forceEnAttente ? 'EN_ATTENTE' : (status ?? existing.status);

    const updated = await prisma.infos_dossier.update({ where: { code_dossier }, data, select: INFOS_SELECT });
    return res.status(200).json({ message: 'Infos dossier mises à jour', infos: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const modifierPaiement = async (req: HybridRequest, res: Response) => {
  try {
    const { code_dossier } = req.params as { code_dossier: string };

    const existing = await prisma.infos_dossier.findUnique({ where: { code_dossier } });
    if (!existing) return res.status(404).json({ message: 'Infos dossier introuvables' });

    const { paiement } = req.body as { paiement?: boolean };
    if (paiement === undefined) {
      return res.status(400).json({ message: 'Le champ paiement est requis (true ou false)' });
    }

    const updated = await prisma.infos_dossier.update({
      where: { code_dossier },
      data: { paiement },
      select: INFOS_SELECT,
    });

    return res.status(200).json({ message: 'Paiement mis à jour', infos: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getInfosDossier = async (req: HybridRequest, res: Response) => {
  try {
    const { code_dossier } = req.params as { code_dossier: string };

    const { allowed, reason } = await resolveCallerAccess(req, code_dossier);
    if (!allowed) return res.status(403).json({ message: reason });

    const infos = await prisma.infos_dossier.findUnique({ where: { code_dossier }, select: INFOS_SELECT });
    if (!infos) return res.status(404).json({ message: 'Infos dossier introuvables' });

    return res.status(200).json({ infos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
