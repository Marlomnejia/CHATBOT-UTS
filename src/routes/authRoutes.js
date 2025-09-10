const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

// Esta es la línea 7 que probablemente causa el error.
// Asegúrate de que authController.createUserRecord sea una función válida.
router.post('/create-user-record', firebaseAuthMiddleware, authController.createUserRecord);

router.post('/google-signin', firebaseAuthMiddleware, authController.googleSignIn);

router.get('/me', firebaseAuthMiddleware, authController.getMe);

module.exports = router;