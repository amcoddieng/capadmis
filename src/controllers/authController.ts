import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

export const register = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, mdp, sexe, ville, payes, date_de_naissance, lieu_de_naissance } = req.body;

    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { email }
    });

    if (existingEtudiant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(mdp, 10);

    const etudiant = await prisma.etudiant.create({
      data: {
        nom,
        prenom,
        email,
        mdp: hashedPassword,
        sexe,
        ville,
        payes,
        date_de_naissance: new Date(date_de_naissance),
        lieu_de_naissance
      }
    });

    const token = jwt.sign(
      { id: etudiant.id, email: etudiant.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Étudiant créé avec succès',
      token,
      etudiant: {
        id: etudiant.id,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mdp } = req.body;

    const etudiant = await prisma.etudiant.findUnique({
      where: { email }
    });

    if (!etudiant) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(mdp, etudiant.mdp);

    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: etudiant.id, email: etudiant.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      etudiant: {
        id: etudiant.id,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
