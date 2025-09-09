const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// Asegúrate de que el middleware se exporte correctamente y que el nombre sea "authMiddleware"
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/grades', authMiddleware, academicController.getStudentGrades);

module.exports = router;
