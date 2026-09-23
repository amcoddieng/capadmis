import { Router } from 'express';
import { creerDossier, monDossier, mesDossiersConseiller, listerDossiers, getDossierById, assignerConseiller, changerStatus, obtenirChecklistDossier, modifierChecklistDossier, } from '../controllers/dossierController.js';
import { verifyEtudiantToken } from '../middleware/etudiantMiddleware.js';
import { verifyPersonnelToken, requireSuperAdminOrAdmin } from '../middleware/personnelMiddleware.js';
const router = Router();
router.get('/moi', verifyEtudiantToken, monDossier);
router.get('/mes-dossiers', verifyPersonnelToken, mesDossiersConseiller);
router.get('/', verifyPersonnelToken, requireSuperAdminOrAdmin, listerDossiers);
router.get('/:id/checklist', verifyPersonnelToken, obtenirChecklistDossier);
router.patch('/:id/checklist', verifyPersonnelToken, modifierChecklistDossier);
router.get('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, getDossierById);
router.post('/', verifyPersonnelToken, requireSuperAdminOrAdmin, creerDossier);
router.patch('/:id/conseiller', verifyPersonnelToken, requireSuperAdminOrAdmin, assignerConseiller);
router.patch('/:id/status', verifyPersonnelToken, changerStatus);
export default router;
//# sourceMappingURL=dossierRoutes.js.map