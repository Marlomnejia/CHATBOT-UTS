const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware para verificar la autenticación
exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No autorizado. Token faltante." });
    }

    try {
        // Decodificar y verificar el JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario en la BD usando el id del token
        const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
        db.query(query, [decoded.id], (error, results) => {
            if (error || results.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado en la base de datos." });
            }

            req.user = results[0]; // Guardamos usuario en req.user
            next();
        });
    } catch (error) {
        console.error("Error al procesar el token:", error);
        return res.status(401).json({ message: 'Token no válido.' });
    }
};

// Middleware para verificar si el usuario es administrador
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};
