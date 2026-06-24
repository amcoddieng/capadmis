import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateUniqueDossierCode } from './dossierController.js';
const SAFE_SELECT = {
    id: true, nom: true, prenom: true, email: true,
    sexe: true, ville: true, payes: true,
    date_de_naissance: true, lieu_de_naissance: true,
    telephone: true,
    bloque: true, createdAt: true, updatedAt: true,
};
export const updateSelf = async (req, res) => {
    try {
        const id = req.etudiant?.id;
        if (!id)
            return res.status(401).json({ message: 'Non authentifié' });
        const etudiant = await prisma.etudiant.findUnique({ where: { id } });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        if (etudiant.bloque)
            return res.status(403).json({ message: 'Compte bloqué' });
        const { nom, prenom, sexe, ville, payes, date_de_naissance, lieu_de_naissance, telephone, mdp, mdp_actuel } = req.body;
        const data = {};
        if (nom)
            data.nom = nom;
        if (prenom)
            data.prenom = prenom;
        if (sexe)
            data.sexe = sexe;
        if (ville)
            data.ville = ville;
        if (payes)
            data.payes = payes;
        if (lieu_de_naissance)
            data.lieu_de_naissance = lieu_de_naissance;
        if (date_de_naissance)
            data.date_de_naissance = new Date(date_de_naissance);
        if (telephone)
            data.telephone = telephone;
        if (mdp) {
            if (!mdp_actuel) {
                return res.status(400).json({ message: 'mdp_actuel est requis pour changer le mot de passe' });
            }
            const isMatch = await bcrypt.compare(mdp_actuel, etudiant.mdp);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
            }
            if (mdp.length < 6) {
                return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
            }
            data.mdp = await bcrypt.hash(mdp, 10);
        }
        const updated = await prisma.etudiant.update({ where: { id }, data, select: SAFE_SELECT });
        return res.status(200).json({ message: 'Profil mis à jour', etudiant: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const createEtudiantByAdmin = async (req, res) => {
    try {
        const { nom, prenom, email, mdp, sexe, ville, payes, date_de_naissance, lieu_de_naissance } = req.body;
        if (!nom || !prenom || !email || !mdp || !sexe || !ville || !payes || !date_de_naissance || !lieu_de_naissance) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }
        const existing = await prisma.etudiant.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ message: 'Cet email est déjà utilisé' });
        const hashedPassword = await bcrypt.hash(mdp, 10);
        const etudiant = await prisma.etudiant.create({
            data: { nom, prenom, email, mdp: hashedPassword, sexe, ville, payes, date_de_naissance: new Date(date_de_naissance), lieu_de_naissance },
            select: { ...SAFE_SELECT, id: true },
        });
        const code_dossier = await generateUniqueDossierCode();
        const dossier = await prisma.dossier.create({
            data: { code_dossier, etudiant_id: etudiant.id },
            select: { id: true, code_dossier: true },
        });
        return res.status(201).json({ message: 'Étudiant créé avec succès', etudiant, dossier });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const updateEtudiantByAdmin = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const etudiant = await prisma.etudiant.findUnique({ where: { id } });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        const { nom, prenom, email, sexe, ville, payes, date_de_naissance, lieu_de_naissance, telephone, mdp } = req.body;
        const data = {};
        if (nom)
            data.nom = nom;
        if (prenom)
            data.prenom = prenom;
        if (email)
            data.email = email;
        if (sexe)
            data.sexe = sexe;
        if (ville)
            data.ville = ville;
        if (payes)
            data.payes = payes;
        if (lieu_de_naissance)
            data.lieu_de_naissance = lieu_de_naissance;
        if (date_de_naissance)
            data.date_de_naissance = new Date(date_de_naissance);
        if (telephone)
            data.telephone = telephone;
        if (mdp)
            data.mdp = await bcrypt.hash(mdp, 10);
        const updated = await prisma.etudiant.update({ where: { id }, data, select: SAFE_SELECT });
        return res.status(200).json({ message: 'Étudiant mis à jour', etudiant: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const deleteEtudiant = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const etudiant = await prisma.etudiant.findUnique({ where: { id } });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        await prisma.etudiant.delete({ where: { id } });
        return res.status(200).json({ message: 'Étudiant supprimé avec succès' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const bloquerEtudiant = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const etudiant = await prisma.etudiant.findUnique({ where: { id } });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        const bloque = !etudiant.bloque;
        const updated = await prisma.etudiant.update({ where: { id }, data: { bloque }, select: SAFE_SELECT });
        return res.status(200).json({
            message: bloque ? 'Étudiant bloqué' : 'Étudiant débloqué',
            etudiant: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const monProfil = async (req, res) => {
    try {
        const id = req.etudiant?.id;
        if (!id)
            return res.status(401).json({ message: 'Non authentifié' });
        const etudiant = await prisma.etudiant.findUnique({
            where: { id },
            select: {
                ...SAFE_SELECT,
                dossier: {
                    select: {
                        id: true,
                        code_dossier: true,
                        status: true,
                        status_admission: true,
                        status_visa: true,
                        conseiller_admission: { select: { id: true, prenom: true, nom: true, code: true, email: true } },
                        conseiller_visa: { select: { id: true, prenom: true, nom: true, code: true, email: true } },
                        infos_dossier: {
                            select: {
                                id: true,
                                niveau_etude: true,
                                pays_souhaite: true,
                                filieres: true,
                                nombre_fois_bac: true,
                                status: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        return res.status(200).json({ etudiant });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerEtudiants = async (_req, res) => {
    try {
        const etudiants = await prisma.etudiant.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'desc' } });
        return res.status(200).json({ etudiants });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=etudiantController.js.map