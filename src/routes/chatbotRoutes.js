const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// --- CAMBIO AQUÍ ---
// Importamos el nuevo middleware de autenticación sin el nombre "firebase"
const { authMiddleware } = require('../middleware/authMiddleware');

// Las rutas ahora usan el nuevo middleware `authMiddleware`
router.post('/ask', authMiddleware, chatbotController.askQuestion);
router.get('/history', authMiddleware, chatbotController.getChatHistory);

module.exports = router;
