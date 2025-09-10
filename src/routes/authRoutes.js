const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

router.post('/create-user-record', firebaseAuthMiddleware, authController.createUserRecord);

router.post('/google-signin', firebaseAuthMiddleware, authController.googleSignIn);

router.get('/me', firebaseAuthMiddleware, authController.getMe);
 
module.exports = router;