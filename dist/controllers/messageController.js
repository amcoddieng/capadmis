import prisma from '../lib/prisma.js';
import { emitToUser } from '../lib/socketServer.js';
function getCallerEmail(req) {
    return req.etudiant?.email ?? req.personnel?.email ?? null;
}
export const envoyerMessage = async (req, res) => {
    try {
        const expediteur = getCallerEmail(req);
        if (!expediteur)
            return res.status(401).json({ message: 'Non authentifié' });
        const { destinataire, contenu } = req.body;
        if (!destinataire || !contenu?.trim()) {
            return res.status(400).json({ message: 'destinataire et contenu sont requis' });
        }
        const destinataireExists = (await prisma.etudiant.findUnique({ where: { email: destinataire }, select: { id: true } })) ||
            (await prisma.personnel.findUnique({ where: { email: destinataire }, select: { id: true } }));
        if (!destinataireExists) {
            return res.status(404).json({ message: 'Destinataire introuvable' });
        }
        const message = await prisma.message.create({
            data: { expediteur, destinataire, contenu: contenu.trim() },
        });
        emitToUser(destinataire, 'message', {
            id: message.id,
            expediteur: message.expediteur,
            contenu: message.contenu,
            vu: message.vu,
            date_creation: message.date_creation,
        });
        return res.status(201).json({ message: 'Message envoyé', data: message });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const mesConversations = async (req, res) => {
    try {
        const email = getCallerEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const messages = await prisma.message.findMany({
            where: { OR: [{ expediteur: email }, { destinataire: email }] },
            orderBy: { date_creation: 'desc' },
        });
        const seen = new Set();
        const conversations = [];
        for (const msg of messages) {
            const interlocuteur = msg.expediteur === email ? msg.destinataire : msg.expediteur;
            if (!seen.has(interlocuteur)) {
                seen.add(interlocuteur);
                const non_lus = await prisma.message.count({
                    where: { expediteur: interlocuteur, destinataire: email, vu: false },
                });
                conversations.push({
                    interlocuteur,
                    dernier_message: msg.contenu,
                    date: msg.date_creation,
                    non_lus,
                });
            }
        }
        return res.status(200).json({ conversations });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getConversation = async (req, res) => {
    try {
        const email = getCallerEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const { interlocuteur } = req.params;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { expediteur: email, destinataire: interlocuteur },
                    { expediteur: interlocuteur, destinataire: email },
                ],
            },
            orderBy: { date_creation: 'asc' },
        });
        await prisma.message.updateMany({
            where: { expediteur: interlocuteur, destinataire: email, vu: false },
            data: { vu: true },
        });
        return res.status(200).json({ messages });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const compterNonLus = async (req, res) => {
    try {
        const email = getCallerEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const count = await prisma.message.count({
            where: { destinataire: email, vu: false },
        });
        return res.status(200).json({ non_lus: count });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const marquerVu = async (req, res) => {
    try {
        const email = getCallerEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const msg = await prisma.message.findUnique({ where: { id } });
        if (!msg)
            return res.status(404).json({ message: 'Message introuvable' });
        if (msg.destinataire !== email)
            return res.status(403).json({ message: 'Accès refusé' });
        const updated = await prisma.message.update({ where: { id }, data: { vu: true } });
        return res.status(200).json({ message: 'Message marqué comme vu', data: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=messageController.js.map