import prisma from '../lib/prisma.js';
function getEmail(req) {
    return req.etudiant?.email ?? req.personnel?.email ?? null;
}
export const mesNotifications = async (req, res) => {
    try {
        const email = getEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const notifications = await prisma.notification.findMany({
            where: { destination: email },
            orderBy: { date_creation: 'desc' },
        });
        return res.status(200).json({ notifications });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const compterNonLues = async (req, res) => {
    try {
        const email = getEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const count = await prisma.notification.count({
            where: { destination: email, lu: false },
        });
        return res.status(200).json({ non_lues: count });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const marquerLue = async (req, res) => {
    try {
        const email = getEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif)
            return res.status(404).json({ message: 'Notification introuvable' });
        if (notif.destination !== email)
            return res.status(403).json({ message: 'Accès refusé' });
        const updated = await prisma.notification.update({ where: { id }, data: { lu: true } });
        return res.status(200).json({ message: 'Notification marquée comme lue', notification: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const marquerToutesLues = async (req, res) => {
    try {
        const email = getEmail(req);
        if (!email)
            return res.status(401).json({ message: 'Non authentifié' });
        await prisma.notification.updateMany({
            where: { destination: email, lu: false },
            data: { lu: true },
        });
        return res.status(200).json({ message: 'Toutes les notifications marquées comme lues' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=notificationController.js.map