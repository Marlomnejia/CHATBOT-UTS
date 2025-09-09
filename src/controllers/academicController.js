// src/controllers/academicController.js
const db = require('../config/db');

/**
 * Obtiene las notas del estudiante autenticado y calcula la definitiva.
 */
exports.getStudentGrades = (req, res) => {
    const userId = req.user.id; // ahora lo obtenemos del JWT

    const query = `
        SELECT 
            c.name AS course_name,
            g.corte1,
            g.corte2,
            g.corte3
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE g.user_id = ?
    `;

    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error en la consulta de notas:", error);
            return res.status(500).json({ message: 'Error al consultar las notas.' });
        }

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        const gradesWithFinal = results.map(grade => {
            const final = (grade.corte1 * 0.3) + (grade.corte2 * 0.3) + (grade.corte3 * 0.4);
            return {
                materia: grade.course_name,
                corte1: grade.corte1,
                corte2: grade.corte2,
                corte3: grade.corte3,
                definitiva: parseFloat(final.toFixed(1))
            };
        });

        res.status(200).json(gradesWithFinal);
    });
};
