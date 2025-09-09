const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

// Middleware para proteger rutas, verificando el token de Firebase
exports.firebaseAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        db.query('SELECT role FROM users WHERE id = ?', [decodedToken.uid], (error, results) => {
            if (error || results.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado en la base de datos." });
            }
            req.user = { 
                id: decodedToken.uid, 
                role: results[0].role 
            };
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Token no es válido.' });
    }
};

// Middleware para verificar si el usuario es un administrador
exports.isAdmin = (req, res, next) => {
  // Asume que firebaseAuthMiddleware ya se ejecutó
  if (req.user && req.user.role === 'admin') {
    next(); // El usuario es admin, continuar
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};