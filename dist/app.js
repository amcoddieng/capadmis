import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './route/authRoutes.js';
import personnelRoutes from './route/personnelRoutes.js';
import etudiantRoutes from './route/etudiantRoutes.js';
import dossierRoutes from './route/dossierRoutes.js';
import infosDossierRoutes from './route/infosDossierRoutes.js';
import mailRoutes from './route/mailRoutes.js';
import codeTemporaireRoutes from './route/codeTemporaireRoutes.js';
import pieceJointeRoutes from './route/pieceJointeRoutes.js';
import notificationRoutes from './route/notificationRoutes.js';
import messageRoutes from './route/messageRoutes.js';
import dossierUniversiteRoutes from './route/dossierUniversiteRoutes.js';
import dashboardRoutes from './route/dashboardRoutes.js';
import whatsappRoutes from './route/whatsappRoutes.js';
const app = express();
// accepter les requêtes depuis le frontend http://localhost:5173 et https://capadmis.netlify.app
const allowedOrigins = ['https://capadmis.netlify.app'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/infos-dossier', infosDossierRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/codes-temporaires', codeTemporaireRoutes);
app.use('/api/pieces-jointes', pieceJointeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dossiers-universite', dossierUniversiteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
export default app;
//# sourceMappingURL=app.js.map