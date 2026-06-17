import express, { json } from 'express';
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

const app = express();

app.use(json());
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

export default app;