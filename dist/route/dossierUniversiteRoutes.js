import { Router } from 'express';
import { createDossierUniversite, getAllDossiersUniversite, getDossierUniversiteById, updateDossierUniversite, deleteDossierUniversite, getDossiersUniversiteByDossier, } from '../controllers/dossierUniversiteController.js';
import { verifyPersonnelToken } from '../middleware/personnelMiddleware.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
const router = Router();
router.get('/dossier/:code_dossier', verifyAnyToken, getDossiersUniversiteByDossier);
router.post('/', verifyPersonnelToken, createDossierUniversite);
router.get('/', verifyPersonnelToken, getAllDossiersUniversite);
router.get('/:id', verifyPersonnelToken, getDossierUniversiteById);
router.patch('/:id', verifyPersonnelToken, updateDossierUniversite);
router.delete('/:id', verifyPersonnelToken, deleteDossierUniversite);
export default router;
//# sourceMappingURL=dossierUniversiteRoutes.js.map