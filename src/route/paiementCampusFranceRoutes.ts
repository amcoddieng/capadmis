import { Router } from 'express';
import {
  getPaiementCampusFrance,
  getRecuCampusFranceUrl,
  uploadRecuCampusFrance,
} from '../controllers/paiementCampusFranceController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/dossier/:code_dossier', verifyAnyToken, getPaiementCampusFrance);
router.post('/dossier/:code_dossier/recu', verifyAnyToken, upload.single('fichier'), uploadRecuCampusFrance);
router.get('/:id/recu', verifyAnyToken, getRecuCampusFranceUrl);

export default router;
