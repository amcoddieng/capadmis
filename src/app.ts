import express, { json } from 'express';
import authRoutes from './route/authRoutes.js';
import personnelRoutes from './route/personnelRoutes.js';
import etudiantRoutes from './route/etudiantRoutes.js';

const app = express();

app.use(json());
app.use('/api/auth', authRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/etudiants', etudiantRoutes);

export default app;