import { Router } from 'express';
import { creerContact, listerContacts, getContactById, modifierContact, supprimerContact, toggleAppele, } from '../controllers/contacterMoiController.js';
import { verifyPersonnelToken } from '../middleware/personnelMiddleware.js';
const router = Router();
router.post('/', creerContact);
router.get('/', verifyPersonnelToken, listerContacts);
router.get('/:id', verifyPersonnelToken, getContactById);
router.put('/:id', verifyPersonnelToken, modifierContact);
router.delete('/:id', verifyPersonnelToken, supprimerContact);
router.patch('/:id/appele', verifyPersonnelToken, toggleAppele);
export default router;
//# sourceMappingURL=contacterMoiRoutes.js.map