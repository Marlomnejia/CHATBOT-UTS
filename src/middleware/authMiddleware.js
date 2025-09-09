const db = require('../config/db');

// Middleware para verificar la autenticación
exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const userId = req.headers['x-user-id'];

    if (!token || !userId) {
        return res.status(401).json({ message: "No autorizado. Token o User ID faltante." });
    }

    try {
        // En un sistema real, aquí decodificarías el token JWT y lo verificarías.
        
        const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
        db.query(query, [userId], (error, results) => {
            if (error || results.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado en la base de datos." });
            }

            req.user = results[0];
            next();
        });
    } catch (error) {
        console.error("Error al procesar el token:", error);
        return res.status(401).json({ message: 'Token no válido.' });
    }
};

// Middleware para verificar si el usuario es un administrador
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};