const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, faqController.getAllFaqs);
router.post('/', authMiddleware, isAdmin, faqController.createFaq);
router.put('/:id', authMiddleware, isAdmin, faqController.updateFaq);
router.delete('/:id', authMiddleware, isAdmin, faqController.deleteFaq);

module.exports = router;