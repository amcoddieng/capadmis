import { Router } from 'express';
import { envoyerMail } from '../controllers/mailController.js';
import { verifyPersonnelToken, requireSuperAdminOrAdmin } from '../middleware/personnelMiddleware.js';
const router = Router();
router.post('/envoyer', verifyPersonnelToken, requireSuperAdminOrAdmin, envoyerMail);
export default router;
//# sourceMappingURL=mailRoutes.js.map