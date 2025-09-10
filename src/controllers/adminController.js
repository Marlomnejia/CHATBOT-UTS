const db = require('../config/db');

/**
 * Obtiene las 10 preguntas más frecuentes hechas por los usuarios.
 */
exports.getTopQuestions = (req, res) => {
    const query = `
        SELECT message, COUNT(*) as count 
        FROM conversation_messages 
        WHERE sender = 'user' 
        GROUP BY message 
        ORDER BY count DESC 
        LIMIT 10;
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error("Error al obtener las analíticas:", error);
            return res.status(500).json({ message: 'Error al consultar las analíticas.' });
        }
        res.status(200).json(results);
    });
};