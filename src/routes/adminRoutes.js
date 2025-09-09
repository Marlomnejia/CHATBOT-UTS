const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Importamos los middlewares de seguridad
const { firebaseAuthMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Ruta protegida para que solo un admin vea las analíticas
router.get('/analytics/top-questions', firebaseAuthMiddleware, isAdmin, adminController.getTopQuestions);

module.exports = router;