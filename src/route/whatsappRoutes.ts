import { Router } from 'express';
import { envoyerWhatsApp } from '../controllers/whatsappController.js';
import { verifyPersonnelToken } from '../middleware/personnelMiddleware.js';

const router = Router();

router.post('/send', verifyPersonnelToken, envoyerWhatsApp);

export default router;
