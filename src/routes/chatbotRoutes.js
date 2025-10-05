const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/ask', protect, chatbotController.askQuestion);
router.get('/history', protect, chatbotController.getChatHistory);

module.exports = router;