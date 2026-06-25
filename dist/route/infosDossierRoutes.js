import { Router } from 'express';
import { creerInfosDossier, modifierInfosDossier, getInfosDossier, modifierPaiement } from '../controllers/infosDossierController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
import { verifyPersonnelToken } from '../middleware/personnelMiddleware.js';
const router = Router();
router.post('/', verifyAnyToken, creerInfosDossier);
router.get('/:code_dossier', verifyAnyToken, getInfosDossier);
router.put('/:code_dossier', verifyAnyToken, modifierInfosDossier);
router.patch('/:code_dossier/paiement', verifyPersonnelToken, modifierPaiement);
export default router;
//# sourceMappingURL=infosDossierRoutes.js.map