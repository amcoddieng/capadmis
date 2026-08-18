import { Router } from 'express';
import { politiqueConfidentialite } from '../controllers/legalController.js';
const router = Router();
router.get('/politique-de-confidentialite', politiqueConfidentialite);
export default router;
//# sourceMappingURL=legalRoutes.js.map