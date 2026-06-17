import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
export const verifyPersonnelToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const personnel = await prisma.personnel.findUnique({
            where: { id: decoded.id },
            select: { bloque: true },
        });
        if (!personnel)
            return res.status(403).json({ message: 'Compte introuvable' });
        if (personnel.bloque)
            return res.status(403).json({ message: 'Compte bloqué' });
        req.personnel = decoded;
        next();
    }
    catch {
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};
export const requireSuperAdmin = (req, res, next) => {
    if (req.personnel?.role !== 'superadmin') {
        return res.status(403).json({ message: 'Accès refusé : réservé au superadmin' });
    }
    next();
};
export const requireSuperAdminOrAdmin = (req, res, next) => {
    const role = req.personnel?.role;
    if (role !== 'superadmin' && role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé : réservé aux admins et superadmins' });
    }
    next();
};
//# sourceMappingURL=personnelMiddleware.js.map