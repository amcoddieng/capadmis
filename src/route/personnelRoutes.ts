import { Router } from 'express';
import {
  createPersonnel,
  loginPersonnel,
  updatePersonnelById,
  deletePersonnelById,
  bloquerPersonnel,
  listerPersonnelPourSuperAdmin,
  listerConseillersPourAdmin,
} from '../controllers/personnelController.js';
import {
  verifyPersonnelToken,
  requireSuperAdmin,
  requireSuperAdminOrAdmin,
} from '../middleware/personnelMiddleware.js';

const router = Router();

router.post('/login', loginPersonnel);
router.get('/liste', verifyPersonnelToken, requireSuperAdmin, listerPersonnelPourSuperAdmin);
router.get('/conseillers', verifyPersonnelToken, requireSuperAdminOrAdmin, listerConseillersPourAdmin);
router.post('/create', verifyPersonnelToken, requireSuperAdminOrAdmin, createPersonnel);
router.put('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, updatePersonnelById);
router.delete('/:id', verifyPersonnelToken, requireSuperAdminOrAdmin, deletePersonnelById);
router.patch('/:id/bloquer', verifyPersonnelToken, requireSuperAdminOrAdmin, bloquerPersonnel);

export default router;
