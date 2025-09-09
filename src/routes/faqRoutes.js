const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
// --- CAMBIO AQUÍ ---
const { firebaseAuthMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/', firebaseAuthMiddleware, faqController.getAllFaqs);
router.post('/', firebaseAuthMiddleware, isAdmin, faqController.createFaq);
router.put('/:id', firebaseAuthMiddleware, isAdmin, faqController.updateFaq);
router.delete('/:id', firebaseAuthMiddleware, isAdmin, faqController.deleteFaq);

module.exports = router;