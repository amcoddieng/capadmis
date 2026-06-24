import prisma from '../lib/prisma.js';
import { envoyerNotification } from '../lib/notificationService.js';
const DOSSIER_SELECT = {
    id: true,
    code_dossier: true,
    etudiant_id: true,
    etudiant: { select: { id: true, nom: true, prenom: true, email: true, ville: true, payes: true, lieu_de_naissance: true, date_de_naissance: true } },
    conseiller_admission_id: true,
    conseiller_admission: { select: { id: true, nom: true, prenom: true, code: true } },
    conseiller_visa_id: true,
    conseiller_visa: { select: { id: true, nom: true, prenom: true, code: true } },
    status: true,
    status_admission: true,
    status_visa: true,
    createdAt: true,
    updatedAt: true,
};
export async function generateUniqueDossierCode() {
    let code;
    let exists;
    do {
        code = String(Math.floor(10000000 + Math.random() * 90000000));
        const found = await prisma.dossier.findUnique({ where: { code_dossier: code } });
        exists = found !== null;
    } while (exists);
    return code;
}
export const creerDossier = async (req, res) => {
    try {
        const { etudiant_id } = req.body;
        if (!etudiant_id) {
            return res.status(400).json({ message: 'etudiant_id est requis' });
        }
        const etudiant = await prisma.etudiant.findUnique({ where: { id: Number(etudiant_id) } });
        if (!etudiant)
            return res.status(404).json({ message: 'Étudiant introuvable' });
        const existingDossier = await prisma.dossier.findUnique({ where: { etudiant_id: Number(etudiant_id) } });
        if (existingDossier)
            return res.status(409).json({ message: 'Cet étudiant a déjà un dossier' });
        const code_dossier = await generateUniqueDossierCode();
        const dossier = await prisma.dossier.create({
            data: { code_dossier, etudiant_id: Number(etudiant_id) },
            select: DOSSIER_SELECT,
        });
        return res.status(201).json({ message: 'Dossier créé avec succès', dossier });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const monDossier = async (req, res) => {
    try {
        const etudiant_id = req.etudiant?.id;
        if (!etudiant_id)
            return res.status(401).json({ message: 'Non authentifié' });
        const dossier = await prisma.dossier.findUnique({
            where: { etudiant_id },
            select: DOSSIER_SELECT,
        });
        if (!dossier)
            return res.status(404).json({ message: 'Aucun dossier trouvé' });
        return res.status(200).json({ dossier });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const mesDossiersConseiller = async (req, res) => {
    try {
        const id = req.personnel?.id;
        if (!id)
            return res.status(401).json({ message: 'Non authentifié' });
        const dossiers = await prisma.dossier.findMany({
            where: { OR: [{ conseiller_admission_id: id }, { conseiller_visa_id: id }] },
            select: DOSSIER_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ dossiers });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerDossiers = async (_req, res) => {
    try {
        const dossiers = await prisma.dossier.findMany({
            select: DOSSIER_SELECT,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ dossiers });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getDossierById = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const dossier = await prisma.dossier.findUnique({ where: { id }, select: DOSSIER_SELECT });
        if (!dossier)
            return res.status(404).json({ message: 'Dossier introuvable' });
        return res.status(200).json({ dossier });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const changerStatus = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const callerRole = req.personnel?.role;
        const callerId = req.personnel?.id;
        const dossier = await prisma.dossier.findUnique({ where: { id } });
        if (!dossier)
            return res.status(404).json({ message: 'Dossier introuvable' });
        const { status, status_admission, status_visa } = req.body;
        const VALID_STATUS = ['EN_COURS_D_ETUDE', 'VALIDE', 'CHANGEMENT_A_APPORTER'];
        const VALID_ADMISSION = ['ADMISSION_EN_COURS', 'ADMISSION_VALIDE', 'ADMISSION_INVALIDE'];
        const VALID_VISA = ['DEMANDE_VISA_EN_COURS', 'DEMANDE_VISA_VALIDE', 'DEMANDE_VISA_INVALIDE'];
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
        }
        else if (isConseillerVisa) {
            if (dossier.conseiller_visa_id !== callerId) {
                return res.status(403).json({ message: 'Vous n\'êtes pas le conseiller visa de ce dossier' });
            }
            if (status || status_admission) {
                return res.status(403).json({ message: 'Le conseiller visa ne peut modifier que status_visa' });
            }
        }
        else if (!isAdminOrSuperAdmin) {
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
        const data = {};
        if (status)
            data.status = status;
        if (status_admission)
            data.status_admission = status_admission;
        if (status_visa)
            data.status_visa = status_visa;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Au moins un champ de status est requis' });
        }
        const updated = await prisma.dossier.update({ where: { id }, data, select: DOSSIER_SELECT });
        const etudiantEmail = updated.etudiant.email;
        const etudiantPrenom = updated.etudiant.prenom;
        const etudiantNom = updated.etudiant.nom;
        const codeDossier = updated.code_dossier;
        if (status === 'VALIDE') {
            envoyerNotification('validation_dossier', etudiantEmail, {
                prenomDestinataire: etudiantPrenom, nomDestinataire: etudiantNom, codeDossier,
            }).catch(console.error);
        }
        else if (status || status_admission || status_visa) {
            const nouveauStatut = status ?? status_admission ?? status_visa ?? '';
            envoyerNotification('change_status', etudiantEmail, {
                prenomDestinataire: etudiantPrenom, nomDestinataire: etudiantNom, codeDossier, nouveauStatut,
            }).catch(console.error);
        }
        return res.status(200).json({ message: 'Status mis à jour', dossier: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const assignerConseiller = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const { type, conseiller_id } = req.body;
        if (!type || !conseiller_id) {
            return res.status(400).json({ message: 'type (admission|visa) et conseiller_id sont requis' });
        }
        const roleAttendu = type === 'admission' ? 'conseiller_admission' : 'conseiller_visa';
        const conseiller = await prisma.personnel.findUnique({ where: { id: Number(conseiller_id) } });
        if (!conseiller)
            return res.status(404).json({ message: 'Conseiller introuvable' });
        if (conseiller.role !== roleAttendu) {
            return res.status(400).json({ message: `Ce personnel n'est pas un ${roleAttendu}` });
        }
        const dossier = await prisma.dossier.findUnique({ where: { id } });
        if (!dossier)
            return res.status(404).json({ message: 'Dossier introuvable' });
        const estPremiereAssignationAdmission = type === 'admission' && !dossier.conseiller_admission_id;
        const data = type === 'admission'
            ? {
                conseiller_admission_id: Number(conseiller_id),
                ...(estPremiereAssignationAdmission ? { status: 'EN_COURS_D_ETUDE' } : {}),
            }
            : { conseiller_visa_id: Number(conseiller_id) };
        const updated = await prisma.dossier.update({ where: { id }, data, select: DOSSIER_SELECT });
        const etudiant = updated.etudiant;
        const notifTypeEtudiant = type === 'admission'
            ? 'assignation_conseiller_admission'
            : 'assignation_conseiller_visa';
        envoyerNotification(notifTypeEtudiant, etudiant.email, {
            prenomDestinataire: etudiant.prenom,
            nomDestinataire: etudiant.nom,
            codeDossier: updated.code_dossier,
            prenomConseiller: conseiller.prenom,
            nomConseiller: conseiller.nom,
        }).catch(console.error);
        envoyerNotification('assignation_dossier', conseiller.email, {
            prenomDestinataire: conseiller.prenom,
            nomDestinataire: conseiller.nom,
            codeDossier: updated.code_dossier,
        }).catch(console.error);
        return res.status(200).json({ message: 'Conseiller assigné avec succès', dossier: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=dossierController.js.map