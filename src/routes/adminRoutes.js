const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas sin middlewares de autenticación
router.get('/analytics/top-questions', adminController.getTopQuestions);
router.get('/analytics/user-activity', adminController.getUserActivity);

module.exports = router;
