const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'un_secreto_muy_dificil_de_adivinar_12345';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const userId = req.headers['x-user-id'];

    if (!token || !userId) {
        return res.status(401).json({ message: "No autorizado. Token o User ID faltante." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.id != userId) {
            return res.status(401).json({ message: "Token inválido para este usuario." });
        }

        db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (error, results) => {
            if (error || results.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado en la base de datos." });
            }

            req.user = results[0];
            next();
        });

    } catch (error) {
        console.error("Error al procesar el token:", error);
        return res.status(401).json({ message: "Token no válido." });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
};

module.exports = { authMiddleware, isAdmin };
