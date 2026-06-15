import { Request, Response } from 'express';
import { StatusDossier, StatusAdmission, StatusVisa } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { EtudiantRequest } from '../middleware/etudiantMiddleware.js';

const DOSSIER_SELECT = {
  id: true,
  code_dossier: true,
  etudiant_id: true,
  etudiant: { select: { id: true, nom: true, prenom: true, email: true } },
  conseiller_admission_id: true,
  conseiller_admission: { select: { id: true, nom: true, prenom: true, code: true } },
  conseiller_visa_id: true,
  conseiller_visa: { select: { id: true, nom: true, prenom: true, code: true } },
  status: true,
  status_admission: true,
  status_visa: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function generateUniqueDossierCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  do {
    code = String(Math.floor(10000000 + Math.random() * 90000000));
    const found = await prisma.dossier.findUnique({ where: { code_dossier: code } });
    exists = found !== null;
  } while (exists);
  return code;
}

export const creerDossier = async (req: Request, res: Response) => {
  try {
    const { etudiant_id } = req.body as { etudiant_id: number };

    if (!etudiant_id) {
      return res.status(400).json({ message: 'etudiant_id est requis' });
    }

    const etudiant = await prisma.etudiant.findUnique({ where: { id: Number(etudiant_id) } });
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable' });

    const existingDossier = await prisma.dossier.findUnique({ where: { etudiant_id: Number(etudiant_id) } });
    if (existingDossier) return res.status(409).json({ message: 'Cet étudiant a déjà un dossier' });

    const code_dossier = await generateUniqueDossierCode();
    const dossier = await prisma.dossier.create({
      data: { code_dossier, etudiant_id: Number(etudiant_id) },
      select: DOSSIER_SELECT,
    });

    return res.status(201).json({ message: 'Dossier créé avec succès', dossier });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const monDossier = async (req: EtudiantRequest, res: Response) => {
  try {
    const etudiant_id = req.etudiant?.id;
    if (!etudiant_id) return res.status(401).json({ message: 'Non authentifié' });

    const dossier = await prisma.dossier.findUnique({
      where: { etudiant_id },
      select: DOSSIER_SELECT,
    });

    if (!dossier) return res.status(404).json({ message: 'Aucun dossier trouvé' });
    return res.status(200).json({ dossier });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const listerDossiers = async (_req: Request, res: Response) => {
  try {
    const dossiers = await prisma.dossier.findMany({
      select: DOSSIER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ dossiers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getDossierById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const dossier = await prisma.dossier.findUnique({ where: { id }, select: DOSSIER_SELECT });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

    return res.status(200).json({ dossier });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const changerStatus = async (req: Request & { personnel?: { id: number; role: string } }, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const callerRole = req.personnel?.role;
    const callerId = req.personnel?.id;

    const dossier = await prisma.dossier.findUnique({ where: { id } });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

    const { status, status_admission, status_visa } = req.body as {
      status?: StatusDossier;
      status_admission?: StatusAdmission;
      status_visa?: StatusVisa;
    };

    const VALID_STATUS: StatusDossier[] = ['EN_COURS_D_ETUDE', 'VALIDE', 'CHANGEMENT_A_APPORTER'];
    const VALID_ADMISSION: StatusAdmission[] = ['ADMISSION_EN_COURS', 'ADMISSION_VALIDE', 'ADMISSION_INVALIDE'];
    const VALID_VISA: StatusVisa[] = ['DEMANDE_VISA_EN_COURS', 'DEMANDE_VISA_VALIDE', 'DEMANDE_VISA_INVALIDE'];

    const isAdminOrSuperAdmin = callerRole === 'superadmin' || callerRole === 'admin';
    const isConseillerAdmission = callerRole === 'conseiller_admission';
    const isConseillerVisa = callerRole === 'conseiller_visa';

    if (isConseillerAdmission) {
      if (dossier.conseiller_admission_id !== callerId) {
        return res.status(403).json({ message: 'Vous n\'êtes pas le conseiller admission de ce dossier' });
      }
      if (status || status_visa) {
        return res.status(403).json({ message: 'Le conseiller admission ne peut modifier que status_admission' });
      }
    } else if (isConseillerVisa) {
      if (dossier.conseiller_visa_id !== callerId) {
        return res.status(403).json({ message: 'Vous n\'êtes pas le conseiller visa de ce dossier' });
      }
      if (status || status_admission) {
        return res.status(403).json({ message: 'Le conseiller visa ne peut modifier que status_visa' });
      }
    } else if (!isAdminOrSuperAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: `status invalide. Valeurs : ${VALID_STATUS.join(', ')}` });
    }
    if (status_admission && !VALID_ADMISSION.includes(status_admission)) {
      return res.status(400).json({ message: `status_admission invalide. Valeurs : ${VALID_ADMISSION.join(', ')}` });
    }
    if (status_visa && !VALID_VISA.includes(status_visa)) {
      return res.status(400).json({ message: `status_visa invalide. Valeurs : ${VALID_VISA.join(', ')}` });
    }

    const data: { status?: StatusDossier; status_admission?: StatusAdmission; status_visa?: StatusVisa } = {};
    if (status) data.status = status;
    if (status_admission) data.status_admission = status_admission;
    if (status_visa) data.status_visa = status_visa;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Au moins un champ de status est requis' });
    }

    const updated = await prisma.dossier.update({ where: { id }, data, select: DOSSIER_SELECT });
    return res.status(200).json({ message: 'Status mis à jour', dossier: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const assignerConseiller = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const { type, conseiller_id } = req.body as { type: 'admission' | 'visa'; conseiller_id: number };

    if (!type || !conseiller_id) {
      return res.status(400).json({ message: 'type (admission|visa) et conseiller_id sont requis' });
    }

    const roleAttendu = type === 'admission' ? 'conseiller_admission' : 'conseiller_visa';
    const conseiller = await prisma.personnel.findUnique({ where: { id: Number(conseiller_id) } });
    if (!conseiller) return res.status(404).json({ message: 'Conseiller introuvable' });
    if (conseiller.role !== roleAttendu) {
      return res.status(400).json({ message: `Ce personnel n'est pas un ${roleAttendu}` });
    }

    const dossier = await prisma.dossier.findUnique({ where: { id } });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

    const data = type === 'admission'
      ? { conseiller_admission_id: Number(conseiller_id) }
      : { conseiller_visa_id: Number(conseiller_id) };

    const updated = await prisma.dossier.update({ where: { id }, data, select: DOSSIER_SELECT });
    return res.status(200).json({ message: 'Conseiller assigné avec succès', dossier: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
