import prisma from '../lib/prisma.js';
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
};
function canAccess(dossier, personnelId, role) {
    if (role === 'superadmin' || role === 'admin')
        return true;
    if (dossier.conseiller_admission_id === personnelId)
        return true;
    if (dossier.conseiller_visa_id === personnelId)
        return true;
    return false;
}
function canModify(dossier, personnelId, role) {
    if (role === 'superadmin' || role === 'admin')
        return true;
    if (dossier.conseiller_admission_id === personnelId)
        return true;
    return false;
}
export const createDossierUniversite = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const { code_dossier, filiere, universite, pays, ville, region, statut, message_universite } = req.body;
        if (!code_dossier || !filiere || !universite || !pays || !ville || !region) {
            return res.status(400).json({ message: 'code_dossier, filiere, universite, pays, ville, region sont requis' });
        }
        const dossier = await prisma.dossier.findUnique({ where: { code_dossier } });
        if (!dossier)
            return res.status(404).json({ message: 'Dossier introuvable' });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getAllDossiersUniversite = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const where = role === 'superadmin' || role === 'admin'
            ? {}
            : { dossier: { OR: [{ conseiller_admission_id: personnelId }, { conseiller_visa_id: personnelId }] } };
        const dossiersUniversite = await prisma.dossier_universite.findMany({
            where,
            select: DOSSIER_UNIVERSITE_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ dossiersUniversite });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getDossierUniversiteById = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const du = await prisma.dossier_universite.findUnique({
            where: { id },
            select: DOSSIER_UNIVERSITE_SELECT,
        });
        if (!du)
            return res.status(404).json({ message: 'Dossier université introuvable' });
        if (!canAccess(du.dossier, personnelId, role)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }
        return res.status(200).json({ dossierUniversite: du });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const updateDossierUniversite = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const existing = await prisma.dossier_universite.findUnique({
            where: { id },
            select: { id: true, dossier: { select: { conseiller_admission_id: true } } },
        });
        if (!existing)
            return res.status(404).json({ message: 'Dossier université introuvable' });
        if (!canModify(existing.dossier, personnelId, role)) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce dossier université' });
        }
        const { filiere, universite, pays, ville, region, statut, message_universite } = req.body;
        const data = {};
        if (filiere !== undefined)
            data.filiere = filiere;
        if (universite !== undefined)
            data.universite = universite;
        if (pays !== undefined)
            data.pays = pays;
        if (ville !== undefined)
            data.ville = ville;
        if (region !== undefined)
            data.region = region;
        if (statut !== undefined)
            data.statut = statut;
        if (message_universite !== undefined)
            data.message_universite = message_universite;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
        }
        const updated = await prisma.dossier_universite.update({
            where: { id },
            data,
            select: DOSSIER_UNIVERSITE_SELECT,
        });
        return res.status(200).json({ message: 'Dossier université mis à jour', dossierUniversite: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const deleteDossierUniversite = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const existing = await prisma.dossier_universite.findUnique({
            where: { id },
            select: { id: true, dossier: { select: { conseiller_admission_id: true } } },
        });
        if (!existing)
            return res.status(404).json({ message: 'Dossier université introuvable' });
        if (!canModify(existing.dossier, personnelId, role)) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce dossier université' });
        }
        await prisma.dossier_universite.delete({ where: { id } });
        return res.status(200).json({ message: 'Dossier université supprimé avec succès' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getDossiersUniversiteByDossier = async (req, res) => {
    try {
        const code_dossier = req.params['code_dossier'];
        if (!code_dossier)
            return res.status(400).json({ message: 'code_dossier requis' });
        const dossier = await prisma.dossier.findUnique({
            where: { code_dossier },
            select: { etudiant_id: true, conseiller_admission_id: true, conseiller_visa_id: true },
        });
        if (!dossier)
            return res.status(404).json({ message: 'Dossier introuvable' });
        if (req.etudiant) {
            const etudiantDossier = await prisma.dossier.findUnique({
                where: { etudiant_id: req.etudiant.id },
                select: { code_dossier: true },
            });
            if (!etudiantDossier || etudiantDossier.code_dossier !== code_dossier) {
                return res.status(403).json({ message: 'Accès refusé' });
            }
        }
        else if (req.personnel) {
            const role = req.personnel.role;
            const pid = req.personnel.id;
            if (role !== 'superadmin' && role !== 'admin') {
                if (dossier.conseiller_admission_id !== pid && dossier.conseiller_visa_id !== pid) {
                    return res.status(403).json({ message: 'Accès refusé' });
                }
            }
        }
        else {
            return res.status(401).json({ message: 'Non authentifié' });
        }
        const dossiersUniversite = await prisma.dossier_universite.findMany({
            where: { code_dossier },
            select: DOSSIER_UNIVERSITE_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ dossiersUniversite });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=dossierUniversiteController.js.map