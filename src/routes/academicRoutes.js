const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
// --- CAMBIO AQUÍ ---
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/grades', firebaseAuthMiddleware, academicController.getStudentGrades);

module.exports = router;