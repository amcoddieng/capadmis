import { Router } from 'express';
import {
  mesNotifications,
  compterNonLues,
  marquerLue,
  marquerToutesLues,
} from '../controllers/notificationController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';

const router = Router();

router.get('/', verifyAnyToken, mesNotifications);
router.get('/non-lues', verifyAnyToken, compterNonLues);
router.patch('/tout-lire', verifyAnyToken, marquerToutesLues);
router.patch('/:id/lu', verifyAnyToken, marquerLue);

export default router;
