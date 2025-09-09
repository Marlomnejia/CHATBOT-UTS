// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No autorizado. Token faltante." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contiene id, name, role
        next();
    } catch (error) {
        console.error("Error al procesar el token:", error);
        return res.status(401).json({ message: 'Token no válido.' });
    }
};

// Middleware para verificar si el usuario es admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};
