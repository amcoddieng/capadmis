import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { TypeCodeTemporaire, TypeUtilisateur } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { sendMail } from '../lib/mailer.js';

const CODE_EXPIRATION_MINUTES = 15;

function genererCode6Chiffres(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function trouverUtilisateurParEmail(email: string): Promise<{
  utilisateur: string;
  type_utilisateur: TypeUtilisateur;
  nom: string;
  mdpActuel: string;
  id: number;
} | null> {
  const etudiant = await prisma.etudiant.findUnique({ where: { email } });
  if (etudiant) {
    const dossier = await prisma.dossier.findUnique({ where: { etudiant_id: etudiant.id } });
    return {
      utilisateur: dossier?.code_dossier ?? String(etudiant.id),
      type_utilisateur: 'etudiant',
      nom: `${etudiant.prenom} ${etudiant.nom}`,
      mdpActuel: etudiant.mdp,
      id: etudiant.id,
    };
  }

  const personnel = await prisma.personnel.findUnique({ where: { email } });
  if (personnel) {
    return {
      utilisateur: personnel.code,
      type_utilisateur: 'personnel',
      nom: `${personnel.prenom} ${personnel.nom}`,
      mdpActuel: personnel.mdp,
      id: personnel.id,
    };
  }

  return null;
}

async function validerCodeHelper(
  email: string,
  code: string,
  type: TypeCodeTemporaire
): Promise<{ valid: boolean; record?: { id: number }; utilisateur?: string; type_utilisateur?: TypeUtilisateur }> {
  const user = await trouverUtilisateurParEmail(email);
  if (!user) return { valid: false };

  const record = await prisma.code_temporaire.findFirst({
    where: {
      code,
      type,
      utilisateur: user.utilisateur,
      type_utilisateur: user.type_utilisateur,
      utilise: false,
      date_expiration: { gt: new Date() },
    },
  });

  if (!record) return { valid: false };
  return { valid: true, record, utilisateur: user.utilisateur, type_utilisateur: user.type_utilisateur };
}

export const genererCode = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body as { email: string; type: TypeCodeTemporaire };

    if (!email || !type) {
      return res.status(400).json({ message: 'email et type sont requis' });
    }

    const VALID_TYPES: TypeCodeTemporaire[] = ['modification_mot_de_passe', 'modification_infos'];
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `type invalide. Valeurs : ${VALID_TYPES.join(', ')}` });
    }

    const user = await trouverUtilisateurParEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }

    await prisma.code_temporaire.deleteMany({
      where: { utilisateur: user.utilisateur, type, utilise: false },
    });

    const code = genererCode6Chiffres();
    const date_expiration = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);

    await prisma.code_temporaire.create({
      data: { type, code, date_expiration, utilisateur: user.utilisateur, type_utilisateur: user.type_utilisateur },
    });

    const labels: Record<TypeCodeTemporaire, string> = {
      modification_mot_de_passe: 'modification de votre mot de passe',
      modification_infos: 'modification de vos informations personnelles',
    };

    await sendMail({
      to: email,
      subject: 'Votre code temporaire CapAdmis',
      message: `Bonjour ${user.nom},\n\nVotre code temporaire pour la ${labels[type]} est :\n\n${code}\n\nCe code est valable ${CODE_EXPIRATION_MINUTES} minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    });

    return res.status(200).json({ message: `Code envoyé à ${email}. Valable ${CODE_EXPIRATION_MINUTES} minutes.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const validerCode = async (req: Request, res: Response) => {
  try {
    const { email, code, type } = req.body as { email: string; code: string; type: TypeCodeTemporaire };

    if (!email || !code || !type) {
      return res.status(400).json({ message: 'email, code et type sont requis' });
    }

    const { valid } = await validerCodeHelper(email, code, type);
    if (!valid) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    return res.status(200).json({ message: 'Code valide' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const modifierMotDePasse = async (req: Request, res: Response) => {
  try {
    const { email, code, nouveau_mdp } = req.body as { email: string; code: string; nouveau_mdp: string };

    if (!email || !code || !nouveau_mdp) {
      return res.status(400).json({ message: 'email, code et nouveau_mdp sont requis' });
    }

    if (nouveau_mdp.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const { valid, record, type_utilisateur } = await validerCodeHelper(email, code, 'modification_mot_de_passe');
    if (!valid || !record) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    const hashedMdp = await bcrypt.hash(nouveau_mdp, 10);

    if (type_utilisateur === 'etudiant') {
      const etudiant = await prisma.etudiant.findUnique({ where: { email } });
      if (etudiant) await prisma.etudiant.update({ where: { id: etudiant.id }, data: { mdp: hashedMdp } });
    } else {
      const personnel = await prisma.personnel.findUnique({ where: { email } });
      if (personnel) await prisma.personnel.update({ where: { id: personnel.id }, data: { mdp: hashedMdp } });
    }

    await prisma.code_temporaire.update({ where: { id: record.id }, data: { utilise: true } });

    return res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const modifierInfos = async (req: Request, res: Response) => {
  try {
    const { email, code, ...infos } = req.body as {
      email: string;
      code: string;
      nom?: string;
      prenom?: string;
      ville?: string;
      payes?: string;
      sexe?: string;
      date_de_naissance?: string;
      lieu_de_naissance?: string;
    };

    if (!email || !code) {
      return res.status(400).json({ message: 'email et code sont requis' });
    }

    const { valid, record, type_utilisateur } = await validerCodeHelper(email, code, 'modification_infos');
    if (!valid || !record) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    const data: Record<string, unknown> = {};
    if (infos.nom) data.nom = infos.nom;
    if (infos.prenom) data.prenom = infos.prenom;
    if (infos.ville) data.ville = infos.ville;
    if (infos.payes) data.payes = infos.payes;
    if (infos.sexe) data.sexe = infos.sexe;
    if (infos.date_de_naissance) data.date_de_naissance = new Date(infos.date_de_naissance);
    if (infos.lieu_de_naissance) data.lieu_de_naissance = infos.lieu_de_naissance;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Au moins un champ à modifier est requis' });
    }

    if (type_utilisateur === 'etudiant') {
      const etudiant = await prisma.etudiant.findUnique({ where: { email } });
      if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable' });
      await prisma.etudiant.update({ where: { id: etudiant.id }, data });
    } else {
      const personnel = await prisma.personnel.findUnique({ where: { email } });
      if (!personnel) return res.status(404).json({ message: 'Personnel introuvable' });
      const personnelData: Record<string, unknown> = {};
      if (data.nom) personnelData.nom = data.nom;
      if (data.prenom) personnelData.prenom = data.prenom;
      await prisma.personnel.update({ where: { id: personnel.id }, data: personnelData });
    }

    await prisma.code_temporaire.update({ where: { id: record.id }, data: { utilise: true } });

    return res.status(200).json({ message: 'Informations mises à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
