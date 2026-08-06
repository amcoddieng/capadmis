import prisma from '../lib/prisma.js';
export const creerContact = async (req, res) => {
    try {
        const { nom_complet, email, telephone, sujet, message } = req.body;
        if (!nom_complet?.trim() || !email?.trim() || !sujet?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: 'nom_complet, email, sujet et message sont requis',
            });
        }
        const contact = await prisma.contacter_moi.create({
            data: {
                nom_complet: nom_complet.trim(),
                email: email.trim().toLowerCase(),
                telephone: telephone?.trim() || null,
                sujet: sujet.trim(),
                message: message.trim(),
            },
        });
        return res.status(201).json({
            message: 'Message de contact envoyé avec succès',
            data: contact,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerContacts = async (_req, res) => {
    try {
        const contacts = await prisma.contacter_moi.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ data: contacts });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getContactById = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        return res.status(200).json({ data: contact });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const modifierContact = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        const { nom_complet, email, telephone, sujet, message } = req.body;
        const data = {};
        if (nom_complet?.trim())
            data.nom_complet = nom_complet.trim();
        if (email?.trim())
            data.email = email.trim().toLowerCase();
        if (telephone !== undefined)
            data.telephone = telephone?.trim() || null;
        if (sujet?.trim())
            data.sujet = sujet.trim();
        if (message?.trim())
            data.message = message.trim();
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
        }
        const updated = await prisma.contacter_moi.update({ where: { id }, data });
        return res.status(200).json({
            message: 'Contact mis à jour',
            data: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const supprimerContact = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        await prisma.contacter_moi.delete({ where: { id } });
        return res.status(200).json({ message: 'Contact supprimé avec succès' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const toggleAppele = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        const updated = await prisma.contacter_moi.update({
            where: { id },
            data: { appele: !contact.appele },
        });
        return res.status(200).json({
            message: `Statut appelé ${updated.appele ? 'activé' : 'désactivé'}`,
            data: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=contacterMoiController.js.map