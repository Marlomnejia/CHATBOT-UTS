const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Esta es la línea 6, que probablemente causa el error.
// Asegúrate de que faqController.getAllFaqs sea una función válida.
router.get('/', protect, faqController.getAllFaqs);
router.post('/', protect, isAdmin, faqController.createFaq);
router.put('/:id', protect, isAdmin, faqController.updateFaq);
router.delete('/:id', protect, isAdmin, faqController.deleteFaq);


module.exports = router;