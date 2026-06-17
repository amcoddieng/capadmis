import { Router } from 'express';
import { envoyerMessage, mesConversations, getConversation, compterNonLus, marquerVu, } from '../controllers/messageController.js';
import { verifyAnyToken } from '../middleware/hybridMiddleware.js';
const router = Router();
router.post('/', verifyAnyToken, envoyerMessage);
router.get('/', verifyAnyToken, mesConversations);
router.get('/non-lus', verifyAnyToken, compterNonLus);
router.get('/:interlocuteur', verifyAnyToken, getConversation);
router.patch('/:id/vu', verifyAnyToken, marquerVu);
export default router;
//# sourceMappingURL=messageRoutes.js.map