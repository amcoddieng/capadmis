import { Router } from 'express';
import { verifyPersonnelToken, requireSuperAdminOrAdmin } from '../middleware/personnelMiddleware.js';
import { getAdminDashboard, getConseillerDashboard } from '../controllers/dashboardController.js';
const router = Router();
router.get('/admin', verifyPersonnelToken, requireSuperAdminOrAdmin, getAdminDashboard);
router.get('/conseiller', verifyPersonnelToken, getConseillerDashboard);
export default router;
//# sourceMappingURL=dashboardRoutes.js.map