const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

// Esta es la línea 7
router.post('/create-user-record', firebaseAuthMiddleware, authController.createUserRecord);

// Esta es la línea 8, que probablemente causa el error
router.post('/google-signin', firebaseAuthMiddleware, authController.googleSignIn);

router.get('/me', firebaseAuthMiddleware, authController.getMe);

module.exports = router;