import { Router } from 'express';
import {
  ajouterPieceJointe,
  listerPiecesJointes,
  getPieceJointe,
  modifierPieceJointe,
  changerStatusPieceJointe,
  supprimerPieceJointe,
} from '../controllers/pieceJointeController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('fichier'), verifyAnyToken, ajouterPieceJointe);
router.get('/dossier/:code_dossier', verifyAnyToken, listerPiecesJointes);
router.get('/:id', verifyAnyToken, getPieceJointe);
router.put('/:id', upload.single('fichier'), verifyAnyToken, modifierPieceJointe);
router.patch('/:id/status', verifyAnyToken, changerStatusPieceJointe);
router.delete('/:id', verifyAnyToken, supprimerPieceJointe);

export default router;
