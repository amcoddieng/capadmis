import { Router } from 'express';
import {
  monProfil,
  updateSelf,
  createEtudiantByAdmin,
  updateEtudiantByAdmin,
  deleteEtudiant,
  bloquerEtudiant,
  listerEtudiants,
} from '../controllers/etudiantController.js';
import { verifyEtudiantToken } from '../middleware/etudiantMiddleware.js';
import { verifyPersonnelToken, requireSuperAdminOrAdmin } from '../middleware/personnelMiddleware.js';

const router = Router();

router.get('/', verifyPersonnelToken, requireSuperAdminOrAdmin, listerEtudiants);
router.get('/me', verifyEtudiantToken, monProfil);
router.put('/me', verifyEtudiantToken, updateSelf);
router.post('/', verifyPersonnelToken, requireSuperAdminOrAdmin, createEtudiantByAdmin);
router.put('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, updateEtudiantByAdmin);
router.delete('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, deleteEtudiant);
router.patch('/:id/bloquer', verifyPersonnelToken, requireSuperAdminOrAdmin, bloquerEtudiant);

export default router;
