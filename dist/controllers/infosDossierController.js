import prisma from '../lib/prisma.js';
const INFOS_SELECT = {
    id: true,
    code_dossier: true,
    niveau_etude: true,
    pays_souhaite: true,
    filieres: true,
    nombre_fois_bac: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};
async function resolveCallerAccess(req, code_dossier) {
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
    const role = personnel.role;
    if (role === 'superadmin' || role === 'admin') {
        return { allowed: true, forceEnAttente: false };
    }
    if (role === 'conseiller_admission' || role === 'conseiller_visa') {
        const dossier = await prisma.dossier.findUnique({
            where: { code_dossier },
            select: { conseiller_admission_id: true, conseiller_visa_id: true },
        });
        if (!dossier)
            return { allowed: false, forceEnAttente: false, reason: 'Dossier introuvable' };
        const isAssigned = (role === 'conseiller_admission' && dossier.conseiller_admission_id === personnel.id) ||
            (role === 'conseiller_visa' && dossier.conseiller_visa_id === personnel.id);
        if (!isAssigned) {
            return { allowed: false, forceEnAttente: false, reason: 'Vous n\'êtes pas assigné à ce dossier' };
        }
        return { allowed: true, forceEnAttente: false };
    }
    return { allowed: false, forceEnAttente: false, reason: 'Accès refusé' };
}
export const creerInfosDossier = async (req, res) => {
    try {
        const { code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac, status } = req.body;
        if (!code_dossier || !niveau_etude || !pays_souhaite || !filieres?.length || nombre_fois_bac === undefined) {
            return res.status(400).json({ message: 'Champs requis : code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac' });
        }
        const { allowed, forceEnAttente, reason } = await resolveCallerAccess(req, code_dossier);
        if (!allowed)
            return res.status(403).json({ message: reason });
        const existing = await prisma.infos_dossier.findUnique({ where: { code_dossier } });
        if (existing)
            return res.status(409).json({ message: 'Des infos existent déjà pour ce dossier, utilisez la modification' });
        const finalStatus = forceEnAttente ? 'EN_ATTENTE' : (status ?? 'EN_ATTENTE');
        const infos = await prisma.infos_dossier.create({
            data: { code_dossier, niveau_etude, pays_souhaite, filieres, nombre_fois_bac: Number(nombre_fois_bac), status: finalStatus },
            select: INFOS_SELECT,
        });
        return res.status(201).json({ message: 'Infos dossier créées avec succès', infos });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const modifierInfosDossier = async (req, res) => {
    try {
        const { code_dossier } = req.params;
        const existing = await prisma.infos_dossier.findUnique({ where: { code_dossier } });
        if (!existing)
            return res.status(404).json({ message: 'Infos dossier introuvables' });
        const { allowed, forceEnAttente, reason } = await resolveCallerAccess(req, code_dossier);
        if (!allowed)
            return res.status(403).json({ message: reason });
        const { niveau_etude, pays_souhaite, filieres, nombre_fois_bac, status } = req.body;
        const VALID_STATUS = ['VALIDE', 'EN_ATTENTE', 'INVALIDE'];
        if (status && !forceEnAttente && !VALID_STATUS.includes(status)) {
            return res.status(400).json({ message: `status invalide. Valeurs : ${VALID_STATUS.join(', ')}` });
        }
        const data = {};
        if (niveau_etude !== undefined)
            data.niveau_etude = niveau_etude;
        if (pays_souhaite !== undefined)
            data.pays_souhaite = pays_souhaite;
        if (filieres !== undefined)
            data.filieres = filieres;
        if (nombre_fois_bac !== undefined)
            data.nombre_fois_bac = Number(nombre_fois_bac);
        data.status = forceEnAttente ? 'EN_ATTENTE' : (status ?? existing.status);
        const updated = await prisma.infos_dossier.update({ where: { code_dossier }, data, select: INFOS_SELECT });
        return res.status(200).json({ message: 'Infos dossier mises à jour', infos: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getInfosDossier = async (req, res) => {
    try {
        const { code_dossier } = req.params;
        const { allowed, reason } = await resolveCallerAccess(req, code_dossier);
        if (!allowed)
            return res.status(403).json({ message: reason });
        const infos = await prisma.infos_dossier.findUnique({ where: { code_dossier }, select: INFOS_SELECT });
        if (!infos)
            return res.status(404).json({ message: 'Infos dossier introuvables' });
        return res.status(200).json({ infos });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=infosDossierController.js.map