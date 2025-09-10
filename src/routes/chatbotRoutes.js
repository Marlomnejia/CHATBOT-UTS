const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

router.post('/ask', firebaseAuthMiddleware, chatbotController.askQuestion);
router.get('/history', firebaseAuthMiddleware, chatbotController.getChatHistory);

module.exports = router;