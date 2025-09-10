const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { firebaseAuthMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Esta es la línea 6, que probablemente causa el error.
// Asegúrate de que faqController.getAllFaqs sea una función válida.
router.get('/', firebaseAuthMiddleware, faqController.getAllFaqs);
router.post('/', firebaseAuthMiddleware, isAdmin, faqController.createFaq);
router.put('/:id', firebaseAuthMiddleware, isAdmin, faqController.updateFaq);
router.delete('/:id', firebaseAuthMiddleware, isAdmin, faqController.deleteFaq);

module.exports = router;