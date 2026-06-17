import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
export const verifyEtudiantToken = async (req, res, next) => {
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
        const etudiant = await prisma.etudiant.findUnique({
            where: { id: decoded.id },
            select: { bloque: true },
        });
        if (!etudiant)
            return res.status(403).json({ message: 'Compte introuvable' });
        if (etudiant.bloque)
            return res.status(403).json({ message: 'Compte bloqué' });
        req.etudiant = decoded;
        next();
    }
    catch {
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};
//# sourceMappingURL=etudiantMiddleware.js.map