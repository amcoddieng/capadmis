import { Response } from 'express';
import path from 'path';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKET } from '../lib/r2.js';
import prisma from '../lib/prisma.js';
import type { HybridRequest } from '../middleware/hybridMiddleware.js';

const MONTANT_FRAIS_CAMPUS_FRANCE = 85000;

const PAIEMENT_SELECT = {
  id: true,
  code_dossier: true,
  montant: true,
  recu: true,
  date_depot: true,
  createdAt: true,
  updatedAt: true,
} as const;

type MulterRequest = HybridRequest & { file?: Express.Multer.File };

async function canReadPaiement(req: HybridRequest, codeDossier: string): Promise<{ allowed: boolean; reason?: string }> {
  if (req.etudiant) {
    const dossier = await prisma.dossier.findUnique({
      where: { etudiant_id: req.etudiant.id },
      select: { code_dossier: true },
    });
    if (!dossier || dossier.code_dossier !== codeDossier) {
      return { allowed: false, reason: 'Ce dossier ne vous appartient pas' };
    }
    return { allowed: true };
  }

  if (req.personnel) {
    const dossier = await prisma.dossier.findUnique({
      where: { code_dossier: codeDossier },
      select: { id: true },
    });
    return dossier ? { allowed: true } : { allowed: false, reason: 'Dossier introuvable' };
  }

  return { allowed: false, reason: 'Non authentifié' };
}

async function getStudentDossier(req: HybridRequest, codeDossier: string) {
  if (!req.etudiant) return null;
  const dossier = await prisma.dossier.findUnique({
    where: { etudiant_id: req.etudiant.id },
    select: { code_dossier: true },
  });
  return dossier?.code_dossier === codeDossier ? dossier : null;
}

export const getPaiementCampusFrance = async (req: HybridRequest, res: Response) => {
  try {
    const { code_dossier } = req.params as { code_dossier: string };
    const access = await canReadPaiement(req, code_dossier);
    if (!access.allowed) return res.status(403).json({ message: access.reason });

    const paiement = await prisma.paiement_campus_france.findUnique({
      where: { code_dossier },
      select: PAIEMENT_SELECT,
    });

    return res.status(200).json({ paiement, montant: MONTANT_FRAIS_CAMPUS_FRANCE });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const uploadRecuCampusFrance = async (req: MulterRequest, res: Response) => {
  try {
    const { code_dossier } = req.params as { code_dossier: string };
    if (!req.file) {
      return res.status(400).json({ message: 'Reçu requis (champ : fichier)' });
    }

    const dossier = await getStudentDossier(req, code_dossier);
    if (!dossier) {
      return res.status(403).json({ message: 'Seul l’étudiant concerné peut déposer ce reçu' });
    }

    const existing = await prisma.paiement_campus_france.findUnique({
      where: { code_dossier },
      select: { recu: true },
    });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const nom = `${code_dossier}_RECU_CAMPUS_FRANCE_${req.etudiant!.id}_${Date.now()}${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: nom,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const paiement = await prisma.paiement_campus_france.upsert({
      where: { code_dossier },
      create: {
        code_dossier,
        montant: MONTANT_FRAIS_CAMPUS_FRANCE,
        recu: nom,
        date_depot: new Date(),
      },
      update: {
        recu: nom,
        date_depot: new Date(),
      },
      select: PAIEMENT_SELECT,
    });

    if (existing?.recu && existing.recu !== nom) {
      r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: existing.recu }))
        .catch((error) => console.error('[R2] Ancien reçu Campus France non supprimé :', error));
    }

    return res.status(201).json({ message: 'Reçu Campus France enregistré', paiement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getRecuCampusFranceUrl = async (req: HybridRequest, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const paiement = await prisma.paiement_campus_france.findUnique({
      where: { id },
      select: PAIEMENT_SELECT,
    });
    if (!paiement?.recu) return res.status(404).json({ message: 'Reçu introuvable' });

    const access = await canReadPaiement(req, paiement.code_dossier);
    if (!access.allowed) return res.status(403).json({ message: access.reason });

    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: paiement.recu }),
      { expiresIn: 3600 }
    );

    return res.status(200).json({ paiement, url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
