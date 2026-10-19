import { Request, Response } from 'express';
import path from 'path';
import { StatutDossierUniversite, AvisChoixUniversite } from '@prisma/client';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from '../lib/prisma.js';
import { r2, R2_BUCKET } from '../lib/r2.js';
import { PersonnelRequest } from '../middleware/personnelMiddleware.js';
import { MixedRequest } from '../middleware/mixedAuthMiddleware.js';

type MulterRequest = PersonnelRequest & { file?: Express.Multer.File };

const DOSSIER_UNIVERSITE_SELECT = {
  id: true,
  code_dossier: true,
  filiere: true,
  universite: true,
  pays: true,
  ville: true,
  region: true,
  statut: true,
  message_universite: true,
  lettre_motivation: true,
  cv: true,
  avis_etudiant: true,
  date_depot: true,
  createdAt: true,
  updatedAt: true,
  dossier: {
    select: {
      id: true,
      code_dossier: true,
      conseiller_admission_id: true,
      conseiller_visa_id: true,
      etudiant: { select: { id: true, nom: true, prenom: true, email: true } },
    },
  },
} as const;

function canAccess(dossier: { conseiller_admission_id: number | null; conseiller_visa_id: number | null }, personnelId: number, role: string): boolean {
  if (role === 'superadmin' || role === 'admin') return true;
  if (dossier.conseiller_admission_id === personnelId) return true;
  if (dossier.conseiller_visa_id === personnelId) return true;
  return false;
}

function canModify(dossier: { conseiller_admission_id: number | null }, personnelId: number, role: string): boolean {
  if (role === 'superadmin' || role === 'admin') return true;
  if (dossier.conseiller_admission_id === personnelId) return true;
  return false;
}

const VALID_AVIS = Object.values(AvisChoixUniversite);

type DossierUnivWithDossier = {
  id: number;
  code_dossier: string;
  dossier: {
    conseiller_admission_id: number | null;
    conseiller_visa_id: number | null;
    etudiant_id: number;
  };
  lettre_motivation: string | null;
  cv: string | null;
};

async function findDossierUniversiteWithDossier(id: number): Promise<DossierUnivWithDossier | null> {
  return await prisma.dossier_universite.findUnique({
    where: { id },
    select: {
      id: true,
      code_dossier: true,
      lettre_motivation: true,
      cv: true,
      dossier: {
        select: {
          conseiller_admission_id: true,
          conseiller_visa_id: true,
          etudiant_id: true,
        },
      },
    },
  }) as DossierUnivWithDossier | null;
}

function buildDocKey(codeDossier: string, dossierUnivId: number, type: 'LETTRE_MOTIVATION' | 'CV', originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${codeDossier}_DU${dossierUnivId}_${type}_${Date.now()}${ext}`;
}

async function checkAccess(du: DossierUnivWithDossier, req: MixedRequest): Promise<boolean> {
  if (req.etudiant) {
    return du.dossier.etudiant_id === req.etudiant.id;
  }
  if (req.personnel) {
    return canAccess(du.dossier, req.personnel.id, req.personnel.role);
  }
  return false;
}

export const createDossierUniversite = async (req: PersonnelRequest, res: Response) => {
  try {
    const personnelId = req.personnel?.id;
    const role = req.personnel?.role;
    if (!personnelId || !role) return res.status(401).json({ message: 'Non authentifié' });

    const { code_dossier, filiere, universite, pays, ville, region, statut, message_universite } = req.body as {
      code_dossier: string;
      filiere: string;
      universite: string;
      pays: string;
      ville: string;
      region: string;
      statut?: StatutDossierUniversite;
      message_universite?: string;
    };

    if (!code_dossier || !filiere || !universite || !pays || !ville || !region) {
      return res.status(400).json({ message: 'code_dossier, filiere, universite, pays, ville, region sont requis' });
    }

    const dossier = await prisma.dossier.findUnique({ where: { code_dossier } });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

    if (!canModify(dossier, personnelId, role)) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à créer un dossier université pour cet étudiant' });
    }

    const created = await prisma.dossier_universite.create({
      data: {
        code_dossier,
        filiere,
        universite,
        pays,
        ville,
        region,
        statut: statut || 'en_attente',
        message_universite: message_universite || null,
      },
      select: DOSSIER_UNIVERSITE_SELECT,
    });

    return res.status(201).json({ message: 'Dossier université créé avec succès', dossierUniversite: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getAllDossiersUniversite = async (req: PersonnelRequest, res: Response) => {
  try {
    const personnelId = req.personnel?.id;
    const role = req.personnel?.role;
    if (!personnelId || !role) return res.status(401).json({ message: 'Non authentifié' });

    const where = role === 'superadmin' || role === 'admin'
      ? {}
      : { dossier: { OR: [{ conseiller_admission_id: personnelId }, { conseiller_visa_id: personnelId }] } };

    const dossiersUniversite = await prisma.dossier_universite.findMany({
      where,
      select: DOSSIER_UNIVERSITE_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ dossiersUniversite });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getDossierUniversiteById = async (req: PersonnelRequest, res: Response) => {
  try {
    const personnelId = req.personnel?.id;
    const role = req.personnel?.role;
    if (!personnelId || !role) return res.status(401).json({ message: 'Non authentifié' });

    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const du = await prisma.dossier_universite.findUnique({
      where: { id },
      select: DOSSIER_UNIVERSITE_SELECT,
    });

    if (!du) return res.status(404).json({ message: 'Dossier université introuvable' });

    if (!canAccess(du.dossier, personnelId, role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    return res.status(200).json({ dossierUniversite: du });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateDossierUniversite = async (req: PersonnelRequest, res: Response) => {
  try {
    const personnelId = req.personnel?.id;
    const role = req.personnel?.role;
    if (!personnelId || !role) return res.status(401).json({ message: 'Non authentifié' });

    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const existing = await prisma.dossier_universite.findUnique({
      where: { id },
      select: { id: true, dossier: { select: { conseiller_admission_id: true } } },
    });

    if (!existing) return res.status(404).json({ message: 'Dossier université introuvable' });

    if (!canModify(existing.dossier, personnelId, role)) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce dossier université' });
    }

    const { filiere, universite, pays, ville, region, statut, message_universite } = req.body as {
      filiere?: string;
      universite?: string;
      pays?: string;
      ville?: string;
      region?: string;
      statut?: StatutDossierUniversite;
      message_universite?: string;
    };

    const data: Record<string, unknown> = {};
    if (filiere !== undefined) data.filiere = filiere;
    if (universite !== undefined) data.universite = universite;
    if (pays !== undefined) data.pays = pays;
    if (ville !== undefined) data.ville = ville;
    if (region !== undefined) data.region = region;
    if (statut !== undefined) data.statut = statut;
    if (message_universite !== undefined) data.message_universite = message_universite;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    const updated = await prisma.dossier_universite.update({
      where: { id },
      data,
      select: DOSSIER_UNIVERSITE_SELECT,
    });

    return res.status(200).json({ message: 'Dossier université mis à jour', dossierUniversite: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteDossierUniversite = async (req: PersonnelRequest, res: Response) => {
  try {
    const personnelId = req.personnel?.id;
    const role = req.personnel?.role;
    if (!personnelId || !role) return res.status(401).json({ message: 'Non authentifié' });

    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const existing = await prisma.dossier_universite.findUnique({
      where: { id },
      select: {
        id: true,
        lettre_motivation: true,
        cv: true,
        dossier: { select: { conseiller_admission_id: true } },
      },
    });

    if (!existing) return res.status(404).json({ message: 'Dossier université introuvable' });

    if (!canModify(existing.dossier, personnelId, role)) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce dossier université' });
    }

    for (const key of [existing.lettre_motivation, existing.cv].filter(Boolean) as string[]) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch(() => {});
    }

    await prisma.dossier_universite.delete({ where: { id } });

    return res.status(200).json({ message: 'Dossier université supprimé avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getDossiersUniversiteByDossier = async (req: MixedRequest, res: Response) => {
  try {
    const code_dossier = req.params['code_dossier'] as string;
    if (!code_dossier) return res.status(400).json({ message: 'code_dossier requis' });

    const dossier = await prisma.dossier.findUnique({
      where: { code_dossier },
      select: { etudiant_id: true, conseiller_admission_id: true, conseiller_visa_id: true },
    });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

    if (req.etudiant) {
      const etudiantDossier = await prisma.dossier.findUnique({
        where: { etudiant_id: req.etudiant.id },
        select: { code_dossier: true },
      });
      if (!etudiantDossier || etudiantDossier.code_dossier !== code_dossier) {
        return res.status(403).json({ message: 'Accès refusé' });
      }
    } else if (req.personnel) {
      const role = req.personnel.role;
      const pid = req.personnel.id;
      if (role !== 'superadmin' && role !== 'admin') {
        if (dossier.conseiller_admission_id !== pid && dossier.conseiller_visa_id !== pid) {
          return res.status(403).json({ message: 'Accès refusé' });
        }
      }
    } else {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const dossiersUniversite = await prisma.dossier_universite.findMany({
      where: { code_dossier },
      select: DOSSIER_UNIVERSITE_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ dossiersUniversite });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateAvisEtudiant = async (req: MixedRequest, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    if (!req.etudiant) {
      return res.status(403).json({ message: 'Seul l\'étudiant peut exprimer son avis' });
    }

    const du = await findDossierUniversiteWithDossier(id);
    if (!du) return res.status(404).json({ message: 'Dossier université introuvable' });
    if (du.dossier.etudiant_id !== req.etudiant.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { avis } = req.body as { avis?: AvisChoixUniversite };
    if (!avis || !VALID_AVIS.includes(avis)) {
      return res.status(400).json({ message: `Avis invalide. Valeurs : ${VALID_AVIS.join(', ')}` });
    }

    const updated = await prisma.dossier_universite.update({
      where: { id },
      data: { avis_etudiant: avis },
      select: DOSSIER_UNIVERSITE_SELECT,
    });

    return res.status(200).json({ message: 'Avis enregistré', dossierUniversite: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

async function uploadUniversiteDocument(
  req: MulterRequest,
  res: Response,
  field: 'lettre_motivation' | 'cv',
  type: 'LETTRE_MOTIVATION' | 'CV'
) {
  try {
    const personnel = req.personnel;
    if (!personnel) return res.status(401).json({ message: 'Non authentifié' });
    if (personnel.role !== 'superadmin') {
      return res.status(403).json({ message: 'Accès réservé au superadmin' });
    }

    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    if (!req.file) {
      return res.status(400).json({ message: 'Fichier requis (champ : fichier)' });
    }

    const du = await findDossierUniversiteWithDossier(id);
    if (!du) return res.status(404).json({ message: 'Dossier université introuvable' });

    const oldKey = field === 'lettre_motivation' ? du.lettre_motivation : du.cv;
    if (oldKey) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldKey })).catch(() => {});
    }

    const key = buildDocKey(du.code_dossier, id, type, req.file.originalname);
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const data = field === 'lettre_motivation' ? { lettre_motivation: key } : { cv: key };
    const updated = await prisma.dossier_universite.update({
      where: { id },
      data,
      select: DOSSIER_UNIVERSITE_SELECT,
    });

    return res.status(200).json({ message: `${type === 'LETTRE_MOTIVATION' ? 'Lettre de motivation' : 'CV'} enregistré`, dossierUniversite: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

export const uploadLettreMotivation = async (req: MulterRequest, res: Response) => {
  return uploadUniversiteDocument(req, res, 'lettre_motivation', 'LETTRE_MOTIVATION');
};

export const uploadCv = async (req: MulterRequest, res: Response) => {
  return uploadUniversiteDocument(req, res, 'cv', 'CV');
};

async function getUniversiteDocumentUrl(
  req: MixedRequest,
  res: Response,
  field: 'lettre_motivation' | 'cv'
) {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const du = await findDossierUniversiteWithDossier(id);
    if (!du) return res.status(404).json({ message: 'Dossier université introuvable' });

    if (!await checkAccess(du, req)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const key = field === 'lettre_motivation' ? du.lettre_motivation : du.cv;
    if (!key) return res.status(404).json({ message: 'Document non disponible' });

    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
      { expiresIn: 3600 }
    );

    return res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

export const getLettreMotivationUrl = async (req: MixedRequest, res: Response) => {
  return getUniversiteDocumentUrl(req, res, 'lettre_motivation');
};

export const getCvUrl = async (req: MixedRequest, res: Response) => {
  return getUniversiteDocumentUrl(req, res, 'cv');
};
