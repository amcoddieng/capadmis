import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { refresh, logout } from '../controllers/refreshTokenController.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
export default router;
//# sourceMappingURL=authRoutes.js.map