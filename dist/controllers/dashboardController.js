import prisma from '../lib/prisma.js';
export const getAdminDashboard = async (req, res) => {
    try {
        const role = req.personnel?.role;
        if (!role)
            return res.status(401).json({ message: 'Non authentifié' });
        if (role !== 'superadmin' && role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux admins' });
        }
        const [totalEtudiants, totalDossiers, totalPersonnel, personnelParRole, dossiersParStatus, dossiersParStatusAdmission, dossiersParStatusVisa, totalDossiersUniversite, dossiersUniversiteParStatut, totalMessagesNonLus, totalNotificationsNonLues,] = await Promise.all([
            prisma.etudiant.count(),
            prisma.dossier.count(),
            prisma.personnel.count({ where: { role: { not: 'superadmin' } } }),
            prisma.personnel.groupBy({ by: ['role'], _count: { role: true } }),
            prisma.dossier.groupBy({ by: ['status'], _count: { status: true } }),
            prisma.dossier.groupBy({ by: ['status_admission'], _count: { status_admission: true } }),
            prisma.dossier.groupBy({ by: ['status_visa'], _count: { status_visa: true } }),
            prisma.dossier_universite.count(),
            prisma.dossier_universite.groupBy({ by: ['statut'], _count: { statut: true } }),
            prisma.message.count({ where: { vu: false } }),
            prisma.notification.count({ where: { lu: false } }),
        ]);
        return res.status(200).json({
            totalEtudiants,
            totalDossiers,
            totalPersonnel,
            personnelParRole: personnelParRole.map((r) => ({
                role: r.role,
                count: r._count.role,
            })),
            dossiersParStatus: dossiersParStatus.map((s) => ({
                status: s.status,
                count: s._count.status,
            })),
            dossiersParStatusAdmission: dossiersParStatusAdmission
                .filter((s) => s.status_admission !== null)
                .map((s) => ({ status: s.status_admission, count: s._count.status_admission })),
            dossiersParStatusVisa: dossiersParStatusVisa
                .filter((s) => s.status_visa !== null)
                .map((s) => ({ status: s.status_visa, count: s._count.status_visa })),
            totalDossiersUniversite,
            dossiersUniversiteParStatut: dossiersUniversiteParStatut.map((s) => ({
                statut: s.statut,
                count: s._count.statut,
            })),
            totalMessagesNonLus,
            totalNotificationsNonLues,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getConseillerDashboard = async (req, res) => {
    try {
        const personnelId = req.personnel?.id;
        const role = req.personnel?.role;
        if (!personnelId || !role)
            return res.status(401).json({ message: 'Non authentifié' });
        const CONSEILLER_ROLES = ['conseiller_admission', 'conseiller_visa'];
        if (!CONSEILLER_ROLES.includes(role)) {
            return res.status(403).json({ message: 'Accès réservé aux conseillers' });
        }
        const dossierWhere = { OR: [{ conseiller_admission_id: personnelId }, { conseiller_visa_id: personnelId }] };
        const [totalDossiersAssignes, dossiersParStatus, dossiersParStatusAdmission, dossiersParStatusVisa, totalDossiersUniversite, dossiersUniversiteParStatut, messagesNonLus, notificationsNonLues,] = await Promise.all([
            prisma.dossier.count({ where: dossierWhere }),
            prisma.dossier.groupBy({ by: ['status'], where: dossierWhere, _count: { status: true } }),
            prisma.dossier.groupBy({ by: ['status_admission'], where: dossierWhere, _count: { status_admission: true } }),
            prisma.dossier.groupBy({ by: ['status_visa'], where: dossierWhere, _count: { status_visa: true } }),
            prisma.dossier_universite.count({
                where: { dossier: dossierWhere },
            }),
            prisma.dossier_universite.groupBy({
                by: ['statut'],
                where: { dossier: dossierWhere },
                _count: { statut: true },
            }),
            prisma.message.count({
                where: {
                    destinataire: req.personnel?.email,
                    vu: false,
                },
            }),
            prisma.notification.count({
                where: {
                    destination: req.personnel?.email,
                    lu: false,
                },
            }),
        ]);
        return res.status(200).json({
            totalDossiersAssignes,
            dossiersParStatus: dossiersParStatus.map((s) => ({
                status: s.status,
                count: s._count.status,
            })),
            dossiersParStatusAdmission: dossiersParStatusAdmission
                .filter((s) => s.status_admission !== null)
                .map((s) => ({ status: s.status_admission, count: s._count.status_admission })),
            dossiersParStatusVisa: dossiersParStatusVisa
                .filter((s) => s.status_visa !== null)
                .map((s) => ({ status: s.status_visa, count: s._count.status_visa })),
            totalDossiersUniversite,
            dossiersUniversiteParStatut: dossiersUniversiteParStatut.map((s) => ({
                statut: s.statut,
                count: s._count.statut,
            })),
            messagesNonLus,
            notificationsNonLues,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=dashboardController.js.map