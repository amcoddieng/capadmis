import { Router } from 'express';
import { genererCode, validerCode, modifierMotDePasse, modifierInfos, } from '../controllers/codeTemporaireController.js';
const router = Router();
router.post('/generer', genererCode);
router.post('/valider', validerCode);
router.post('/modifier-mot-de-passe', modifierMotDePasse);
router.post('/modifier-infos', modifierInfos);
export default router;
//# sourceMappingURL=codeTemporaireRoutes.js.map