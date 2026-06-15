import { Router } from 'express';
import {
  creerDossier,
  monDossier,
  listerDossiers,
  getDossierById,
  assignerConseiller,
  changerStatus,
} from '../controllers/dossierController.js';
import { verifyEtudiantToken } from '../middleware/etudiantMiddleware.js';
import { verifyPersonnelToken, requireSuperAdminOrAdmin } from '../middleware/personnelMiddleware.js';

const router = Router();

router.get('/moi', verifyEtudiantToken, monDossier);
router.get('/', verifyPersonnelToken, requireSuperAdminOrAdmin, listerDossiers);
router.get('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, getDossierById);
router.post('/', verifyPersonnelToken, requireSuperAdminOrAdmin, creerDossier);
router.patch('/:id/conseiller', verifyPersonnelToken, requireSuperAdminOrAdmin, assignerConseiller);
router.patch('/:id/status', verifyPersonnelToken, changerStatus);

export default router;
