import { Router } from 'express';
import { soumettreLandingLead } from '../controllers/landingLeadController.js';
const router = Router();
router.post('/', soumettreLandingLead);
export default router;
//# sourceMappingURL=landingLeadRoutes.js.map