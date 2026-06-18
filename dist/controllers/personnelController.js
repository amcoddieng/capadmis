import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateAccessToken, createRefreshToken, setRefreshTokenCookie, revokeAllUserRefreshTokens, } from '../lib/tokenService.js';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
const CONSEILLER_ROLES = ['conseiller_visa', 'conseiller_admission'];
const ALLOWED_ROLES = ['admin', ...CONSEILLER_ROLES];
const SAFE_SELECT = {
    id: true, prenom: true, nom: true, code: true,
    email: true, role: true, bloque: true, createdAt: true,
};
async function generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let exists;
    do {
        code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const found = await prisma.personnel.findUnique({ where: { code } });
        exists = found !== null;
    } while (exists);
    return code;
}
export const createPersonnel = async (req, res) => {
    try {
        const callerRole = req.personnel?.role;
        const { prenom, nom, email, mdp, role } = req.body;
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
        if (existing)
            return res.status(409).json({ message: 'Cet email est déjà utilisé' });
        const code = await generateUniqueCode();
        const hashedPassword = await bcrypt.hash(mdp, 10);
        const personnel = await prisma.personnel.create({
            data: { prenom, nom, code, email, mdp: hashedPassword, role },
            select: SAFE_SELECT,
        });
        return res.status(201).json({ message: 'Personnel créé avec succès', personnel });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const updatePersonnelById = async (req, res) => {
    try {
        const callerRole = req.personnel?.role;
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const target = await prisma.personnel.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ message: 'Personnel introuvable' });
        if (target.role === 'superadmin') {
            return res.status(403).json({ message: 'Impossible de modifier un superadmin' });
        }
        if (target.role === 'admin' && callerRole !== 'superadmin') {
            return res.status(403).json({ message: 'Seul le superadmin peut modifier un admin' });
        }
        const { prenom, nom, email, mdp } = req.body;
        const data = {};
        if (prenom)
            data.prenom = prenom;
        if (nom)
            data.nom = nom;
        if (email)
            data.email = email;
        if (mdp)
            data.mdp = await bcrypt.hash(mdp, 10);
        const updated = await prisma.personnel.update({ where: { id }, data, select: SAFE_SELECT });
        return res.status(200).json({ message: 'Personnel mis à jour', personnel: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const deletePersonnelById = async (req, res) => {
    try {
        const callerRole = req.personnel?.role;
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const target = await prisma.personnel.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ message: 'Personnel introuvable' });
        if (target.role === 'superadmin') {
            return res.status(403).json({ message: 'Impossible de supprimer un superadmin' });
        }
        if (target.role === 'admin' && callerRole !== 'superadmin') {
            return res.status(403).json({ message: 'Seul le superadmin peut supprimer un admin' });
        }
        await prisma.personnel.delete({ where: { id } });
        return res.status(200).json({ message: 'Personnel supprimé avec succès' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const bloquerPersonnel = async (req, res) => {
    try {
        const callerRole = req.personnel?.role;
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const target = await prisma.personnel.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ message: 'Personnel introuvable' });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const loginPersonnel = async (req, res) => {
    try {
        const { email, mdp } = req.body;
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const updateSelfPersonnel = async (req, res) => {
    try {
        const id = req.personnel?.id;
        if (!id)
            return res.status(401).json({ message: 'Non authentifié' });
        const target = await prisma.personnel.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ message: 'Personnel introuvable' });
        if (target.bloque)
            return res.status(403).json({ message: 'Compte bloqué' });
        const { prenom, nom, mdp, mdp_actuel } = req.body;
        const data = {};
        if (prenom)
            data.prenom = prenom;
        if (nom)
            data.nom = nom;
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerPersonnelPourSuperAdmin = async (_req, res) => {
    try {
        const personnel = await prisma.personnel.findMany({
            where: { role: { not: 'superadmin' } },
            select: SAFE_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ personnel });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerConseillersPourAdmin = async (_req, res) => {
    try {
        const conseillers = await prisma.personnel.findMany({
            where: { role: { in: CONSEILLER_ROLES } },
            select: SAFE_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ conseillers });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=personnelController.js.map