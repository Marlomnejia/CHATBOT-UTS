const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

// Ruta para guardar el registro de un nuevo usuario en la BD (ahora protegida)
router.post('/create-user-record', firebaseAuthMiddleware, authController.createUserRecord);

// Ruta para manejar el inicio de sesión con Google
router.post('/google-signin', firebaseAuthMiddleware, authController.googleSignIn);

// Ruta protegida para obtener los datos del usuario actual
router.get('/me', firebaseAuthMiddleware, authController.getMe);

module.exports = router;