import { Router } from 'express';
import { creerInfosDossier, modifierInfosDossier, getInfosDossier } from '../controllers/infosDossierController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';

const router = Router();

router.post('/', verifyAnyToken, creerInfosDossier);
router.get('/:code_dossier', verifyAnyToken, getInfosDossier);
router.put('/:code_dossier', verifyAnyToken, modifierInfosDossier);

export default router;
