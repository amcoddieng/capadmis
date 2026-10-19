import { Router } from 'express';
import {
  createDossierUniversite,
  getAllDossiersUniversite,
  getDossierUniversiteById,
  updateDossierUniversite,
  deleteDossierUniversite,
  getDossiersUniversiteByDossier,
  updateAvisEtudiant,
  uploadLettreMotivation,
  uploadCv,
  getLettreMotivationUrl,
  getCvUrl,
} from '../controllers/dossierUniversiteController.js';
import { verifyPersonnelToken, requireSuperAdmin } from '../middleware/personnelMiddleware.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/dossier/:code_dossier', verifyAnyToken, getDossiersUniversiteByDossier);
router.post('/', verifyPersonnelToken, createDossierUniversite);
router.get('/', verifyPersonnelToken, getAllDossiersUniversite);

router.patch('/:id/avis', verifyAnyToken, updateAvisEtudiant);
router.patch('/:id/lettre-motivation', verifyPersonnelToken, requireSuperAdmin, upload.single('fichier'), uploadLettreMotivation);
router.patch('/:id/cv', verifyPersonnelToken, requireSuperAdmin, upload.single('fichier'), uploadCv);
router.get('/:id/lettre-motivation', verifyAnyToken, getLettreMotivationUrl);
router.get('/:id/cv', verifyAnyToken, getCvUrl);

router.get('/:id', verifyPersonnelToken, getDossierUniversiteById);
router.patch('/:id', verifyPersonnelToken, updateDossierUniversite);
router.delete('/:id', verifyPersonnelToken, deleteDossierUniversite);

export default router;
