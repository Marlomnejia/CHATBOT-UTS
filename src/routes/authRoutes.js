const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Ruta para el inicio de sesión
router.post('/login', authController.login);
// Ruta para el registro de usuarios
router.post('/register', authController.register);

// Ruta para guardar el registro de un nuevo usuario en la base de datos
router.post('/create-user-record', authMiddleware, authController.createUserRecord);

// Ruta protegida para obtener los datos del usuario actual
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;