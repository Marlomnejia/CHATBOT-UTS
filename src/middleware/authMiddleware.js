const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

// Middleware para proteger rutas, verificando el token de Firebase
exports.firebaseAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Auth header recibido:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token ausente o formato incorrecto');
        return res.status(401).json({ message: 'No hay token o tiene un formato incorrecto, autorización denegada.' });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token recibido:', token);
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token decodificado:', decodedToken);
        // Adjuntamos la información básica del token a la petición
        req.user = { 
            uid: decodedToken.uid,
            name: decodedToken.name,
            email: decodedToken.email
        };

        db.query('SELECT role FROM users WHERE id = ?', [decodedToken.uid], (error, results) => {
            if (error || results.length === 0) {
                console.log('Usuario no encontrado en la base de datos o error en la consulta:', error);
                req.user.role = results.length > 0 ? results[0].role : 'student';
                return next();
            }
            // Si lo encontramos, añadimos el rol de nuestra BD
            req.user.role = results[0].role;
            next();
        });
    } catch (error) {
        console.error('Error verificando el token:', error);
        res.status(403).json({ message: 'Token no es válido.', error: error.message, code: error.code });
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