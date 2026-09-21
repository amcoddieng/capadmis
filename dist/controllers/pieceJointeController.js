import path from 'path';
import JSZip from 'jszip';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TypePieceJointe, StatusPieceJointe } from '@prisma/client';
import { r2, R2_BUCKET } from '../lib/r2.js';
import prisma from '../lib/prisma.js';
import { envoyerNotification } from '../lib/notificationService.js';
import { sendMail } from '../lib/mailer.js';
const PIECE_SELECT = {
    id: true,
    nom: true,
    codeDossier: true,
    type: true,
    status: true,
    date_creation: true,
    updatedAt: true,
};
const VALID_TYPES = Object.values(TypePieceJointe);
const VALID_STATUS = Object.values(StatusPieceJointe);
async function resolveAccess(req, codeDossier) {
    const { etudiant, personnel } = req;
    if (etudiant) {
        const dossier = await prisma.dossier.findUnique({
            where: { etudiant_id: etudiant.id },
            select: { code_dossier: true },
        });
        if (!dossier || dossier.code_dossier !== codeDossier) {
            return { role: null, reason: 'Ce dossier ne vous appartient pas' };
        }
        return { role: 'etudiant' };
    }
    if (personnel) {
        if (personnel.role === 'superadmin' || personnel.role === 'admin') {
            return { role: 'admin_superadmin' };
        }
        const dossier = await prisma.dossier.findUnique({
            where: { code_dossier: codeDossier },
            select: { conseiller_admission_id: true, conseiller_visa_id: true },
        });
        if (!dossier)
            return { role: null, reason: 'Dossier introuvable' };
        const isAssigned = (personnel.role === 'conseiller_admission' && dossier.conseiller_admission_id === personnel.id) ||
            (personnel.role === 'conseiller_visa' && dossier.conseiller_visa_id === personnel.id);
        if (!isAssigned)
            return { role: null, reason: 'Vous n\'êtes pas assigné à ce dossier' };
        return { role: 'conseiller' };
    }
    return { role: null, reason: 'Non authentifié' };
}
function buildNom(codeDossier, type, etudiantId, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const id = etudiantId ?? 0;
    return `${codeDossier}_${type}_${id}_${Date.now()}${ext}`;
}
async function notifierDocument(codeDossier, type, action) {
    const dossier = await prisma.dossier.findUnique({
        where: { code_dossier: codeDossier },
        select: { etudiant: { select: { prenom: true, nom: true, email: true, telephone: true } } },
    });
    const etudiant = dossier?.etudiant;
    await sendMail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL || 'capadmis.france@gmail.com',
        subject: `Document ${action} — ${codeDossier}`,
        message: `Un document a été ${action} dans un dossier étudiant.\n\nDossier : ${codeDossier}\nType de document : ${type}\nÉtudiant : ${etudiant ? `${etudiant.prenom} ${etudiant.nom}` : 'Non identifié'}\nEmail : ${etudiant?.email || 'Non renseigné'}\nTéléphone : ${etudiant?.telephone || 'Non renseigné'}`,
    });
}
export const ajouterPieceJointe = async (req, res) => {
    try {
        const { codeDossier, type } = req.body;
        if (!codeDossier || !type) {
            return res.status(400).json({ message: 'codeDossier et type sont requis' });
        }
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: `type invalide. Valeurs : ${VALID_TYPES.join(', ')}` });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier requis (champ : fichier)' });
        }
        const { role, reason } = await resolveAccess(req, codeDossier);
        if (!role)
            return res.status(403).json({ message: reason });
        if (role === 'conseiller')
            return res.status(403).json({ message: 'Les conseillers ne peuvent pas ajouter des pièces jointes' });
        const nom = buildNom(codeDossier, type, req.etudiant?.id, req.file.originalname);
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: nom,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        }));
        const piece = await prisma.piece_jointe.create({
            data: { nom, codeDossier, type },
            select: PIECE_SELECT,
        });
        notifierDocument(codeDossier, piece.type, 'ajouté')
            .catch((mailError) => console.error('[Email] Notification d’ajout de document non envoyée :', mailError));
        return res.status(201).json({ message: 'Pièce jointe ajoutée', piece });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerPiecesJointes = async (req, res) => {
    try {
        const { code_dossier } = req.params;
        const { role, reason } = await resolveAccess(req, code_dossier);
        if (!role)
            return res.status(403).json({ message: reason });
        const pieces = await prisma.piece_jointe.findMany({
            where: { codeDossier: code_dossier },
            select: PIECE_SELECT,
            orderBy: { date_creation: 'desc' },
        });
        return res.status(200).json({ pieces });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getPieceJointe = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const piece = await prisma.piece_jointe.findUnique({ where: { id }, select: PIECE_SELECT });
        if (!piece)
            return res.status(404).json({ message: 'Pièce jointe introuvable' });
        const { role, reason } = await resolveAccess(req, piece.codeDossier);
        if (!role)
            return res.status(403).json({ message: reason });
        const url = await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: piece.nom }), { expiresIn: 3600 });
        return res.status(200).json({ piece, url });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
const TYPE_PJ_FOLDERS = {
    PHOTO_PROFIL: 'dossier identite',
    PASSEPORT: 'dossier identite',
    CARTE_IDENTITE: 'dossier identite',
    DIPLOME_BAC: 'dossier scolaire/baccalaureat',
    RELEVE_NOTES_BAC: 'dossier scolaire/baccalaureat',
    BULLETIN_NOTES_SECONDE: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_SECONDE1: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_SECONDE2: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_PREMIERE: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_PREMIERE1: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_PREMIERE2: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_TERMINALE: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_TERMINALE1: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_TERMINALE2: 'dossier scolaire/secondaire',
    BULLETIN_NOTES_LICENCE_1: 'dossier scolaire/licence',
    BULLETIN_NOTES_LICENCE_2: 'dossier scolaire/licence',
    BULLETIN_NOTES_LICENCE_3: 'dossier scolaire/licence',
    DIPLOME_LICENCE: 'dossier scolaire/licence',
    BULLETIN_NOTES_BT1_S1: 'dossier scolaire/bts',
    BULLETIN_NOTES_BT1_S2: 'dossier scolaire/bts',
    BULLETIN_NOTES_BT2_S1: 'dossier scolaire/bts',
    BULLETIN_NOTES_BT2_S2: 'dossier scolaire/bts',
    BULLETIN_NOTES_BT3_S1: 'dossier scolaire/bts',
    BULLETIN_NOTES_BT3_S2: 'dossier scolaire/bts',
    BULLETIN_NOTES_MASTER_1: 'dossier scolaire/master',
    BULLETIN_NOTES_MASTER_2: 'dossier scolaire/master',
    DIPLOME_MASTER: 'dossier scolaire/master',
    BULLETIN_NOTES_DOCTORAT: 'dossier scolaire/doctorat',
    DIPLOME_DOCTORAT: 'dossier scolaire/doctorat',
    LETTRE_MOTIVATION: 'dossier autres',
    CV: 'dossier autres',
    ATTESTATION: 'dossier autres',
    AUTRE: 'dossier autres',
};
function sanitizeFolderName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_').trim() || 'Divers';
}
export const telechargerPiecesJointesZip = async (req, res) => {
    try {
        const { code_dossier } = req.params;
        const { role, reason } = await resolveAccess(req, code_dossier);
        if (!role)
            return res.status(403).json({ message: reason });
        const dossier = await prisma.dossier.findUnique({
            where: { code_dossier },
            select: { etudiant: { select: { prenom: true, nom: true } } },
        });
        const pieces = await prisma.piece_jointe.findMany({
            where: { codeDossier: code_dossier },
            select: PIECE_SELECT,
            orderBy: { date_creation: 'desc' },
        });
        if (pieces.length === 0) {
            return res.status(404).json({ message: 'Aucune pièce jointe pour ce dossier' });
        }
        const prenom = dossier?.etudiant?.prenom || '';
        const nom = dossier?.etudiant?.nom || '';
        const folderName = sanitizeFolderName(`${code_dossier}_${prenom}_${nom}`.replace(/_+$/, '').replace(/^_+/, '') || `${code_dossier}_pieces`);
        const zip = new JSZip();
        const root = zip.folder(folderName) || zip;
        for (const piece of pieces) {
            try {
                const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: piece.nom }));
                const body = obj.Body;
                if (!body)
                    continue;
                const chunks = [];
                for await (const chunk of body) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                }
                const buffer = Buffer.concat(chunks);
                const folderPath = TYPE_PJ_FOLDERS[piece.type] || 'dossier autres';
                const folder = root.folder(sanitizeFolderName(folderPath)) || root;
                folder.file(piece.nom, buffer);
            }
            catch (err) {
                console.error(`Erreur lors du téléchargement de ${piece.nom}:`, err);
            }
        }
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
        res.setHeader('Content-Length', content.length.toString());
        return res.status(200).send(content);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const modifierPieceJointe = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const piece = await prisma.piece_jointe.findUnique({ where: { id }, select: PIECE_SELECT });
        if (!piece)
            return res.status(404).json({ message: 'Pièce jointe introuvable' });
        const { role, reason } = await resolveAccess(req, piece.codeDossier);
        if (!role)
            return res.status(403).json({ message: reason });
        if (role === 'conseiller')
            return res.status(403).json({ message: 'Utilisez PATCH /:id/status pour modifier le statut' });
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier requis (champ : fichier)' });
        }
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: piece.nom }));
        const nouveauNom = buildNom(piece.codeDossier, piece.type, req.etudiant?.id, req.file.originalname);
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: nouveauNom,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        }));
        const data = { nom: nouveauNom };
        if (role === 'admin_superadmin') {
            const { type, status } = req.body;
            if (type && VALID_TYPES.includes(type))
                data.type = type;
            if (status && VALID_STATUS.includes(status))
                data.status = status;
        }
        const updated = await prisma.piece_jointe.update({ where: { id }, data, select: PIECE_SELECT });
        notifierDocument(updated.codeDossier, updated.type, 'modifié')
            .catch((mailError) => console.error('[Email] Notification de modification de document non envoyée :', mailError));
        return res.status(200).json({ message: 'Pièce jointe mise à jour', piece: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const changerStatusPieceJointe = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const piece = await prisma.piece_jointe.findUnique({ where: { id }, select: PIECE_SELECT });
        if (!piece)
            return res.status(404).json({ message: 'Pièce jointe introuvable' });
        const { role, reason } = await resolveAccess(req, piece.codeDossier);
        if (!role)
            return res.status(403).json({ message: reason });
        if (role === 'etudiant')
            return res.status(403).json({ message: 'Les étudiants ne peuvent pas modifier le statut' });
        const { status } = req.body;
        if (!status || !VALID_STATUS.includes(status)) {
            return res.status(400).json({ message: `status invalide. Valeurs : ${VALID_STATUS.join(', ')}` });
        }
        const updated = await prisma.piece_jointe.update({ where: { id }, data: { status }, select: PIECE_SELECT });
        if (status === 'A_CHANGER') {
            const dossier = await prisma.dossier.findUnique({
                where: { code_dossier: piece.codeDossier },
                select: { etudiant: { select: { email: true, prenom: true, nom: true } } },
            });
            if (dossier?.etudiant) {
                envoyerNotification('demande_changement_document', dossier.etudiant.email, {
                    prenomDestinataire: dossier.etudiant.prenom,
                    nomDestinataire: dossier.etudiant.nom,
                    codeDossier: piece.codeDossier,
                }).catch(console.error);
            }
        }
        return res.status(200).json({ message: 'Statut mis à jour', piece: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const supprimerPieceJointe = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const piece = await prisma.piece_jointe.findUnique({ where: { id }, select: PIECE_SELECT });
        if (!piece)
            return res.status(404).json({ message: 'Pièce jointe introuvable' });
        const { role, reason } = await resolveAccess(req, piece.codeDossier);
        if (!role)
            return res.status(403).json({ message: reason });
        if (role === 'conseiller')
            return res.status(403).json({ message: 'Les conseillers ne peuvent pas supprimer des pièces jointes' });
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: piece.nom }));
        await prisma.piece_jointe.delete({ where: { id } });
        return res.status(200).json({ message: 'Pièce jointe supprimée' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=pieceJointeController.js.map