const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { firebaseAuthMiddleware } = require('../middleware/authMiddleware');

// Esta es la línea 8 que probablemente causa el error.
// Asegúrate de que academicController.getStudentGrades sea una función válida.
router.get('/grades', firebaseAuthMiddleware, academicController.getStudentGrades);

module.exports = router;