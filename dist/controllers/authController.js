import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateUniqueDossierCode } from './dossierController.js';
import { generateAccessToken, createRefreshToken, setRefreshTokenCookie, revokeAllUserRefreshTokens, } from '../lib/tokenService.js';
export const register = async (req, res) => {
    try {
        const { nom, prenom, email, mdp, sexe, ville, payes, date_de_naissance, lieu_de_naissance, telephone } = req.body;
        if (!telephone) {
            return res.status(400).json({ message: 'Le numéro de téléphone est requis' });
        }
        const existingEtudiant = await prisma.etudiant.findUnique({ where: { email } });
        if (existingEtudiant) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        const existingTelephone = await prisma.etudiant.findUnique({ where: { telephone } });
        if (existingTelephone) {
            return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }
        const hashedPassword = await bcrypt.hash(mdp, 10);
        //  dogeolh
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
                lieu_de_naissance,
                telephone
            }
        });
        const code_dossier = await generateUniqueDossierCode();
        const dossier = await prisma.dossier.create({
            data: { code_dossier, etudiant_id: etudiant.id },
            select: { id: true, code_dossier: true },
        });
        const accessToken = generateAccessToken({ id: etudiant.id, email: etudiant.email });
        const refreshToken = await createRefreshToken(etudiant.id, 'etudiant');
        setRefreshTokenCookie(res, refreshToken);
        return res.status(201).json({
            message: 'Étudiant créé avec succès',
            accessToken,
            etudiant: {
                id: etudiant.id,
                nom: etudiant.nom,
                prenom: etudiant.prenom,
                email: etudiant.email
            },
            dossier: { id: dossier.id, code_dossier: dossier.code_dossier },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, mdp } = req.body;
        const etudiant = await prisma.etudiant.findUnique({
            where: { email }
        });
        if (!etudiant) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        if (etudiant.bloque) {
            return res.status(403).json({ message: 'Votre compte est bloqué' });
        }
        const isMatch = await bcrypt.compare(mdp, etudiant.mdp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        await revokeAllUserRefreshTokens(etudiant.id, 'etudiant');
        const accessToken = generateAccessToken({ id: etudiant.id, email: etudiant.email });
        const refreshToken = await createRefreshToken(etudiant.id, 'etudiant');
        setRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({
            message: 'Connexion réussie',
            accessToken,
            etudiant: {
                id: etudiant.id,
                nom: etudiant.nom,
                prenom: etudiant.prenom,
                email: etudiant.email
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=authController.js.map