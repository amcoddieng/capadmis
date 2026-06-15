import express, { json } from 'express';
import authRoutes from './route/authRoutes.js';
import personnelRoutes from './route/personnelRoutes.js';
import etudiantRoutes from './route/etudiantRoutes.js';
import dossierRoutes from './route/dossierRoutes.js';
import infosDossierRoutes from './route/infosDossierRoutes.js';

const app = express();

app.use(json());
app.use('/api/auth', authRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/infos-dossier', infosDossierRoutes);

export default app;