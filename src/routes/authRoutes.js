const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rutas protegidas
router.post('/create-user-record', authMiddleware, authController.createUserRecord);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
