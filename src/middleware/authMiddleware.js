const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

// Middleware para proteger rutas, verificando el token de Firebase
exports.firebaseAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No hay token o tiene un formato incorrecto, autorización denegada.' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Adjuntamos la información básica del token a la petición
        // La info completa (nombre, rol) la buscaremos en la BD si es necesario
        req.user = { 
            uid: decodedToken.uid,
            name: decodedToken.name,
            email: decodedToken.email
        };

        db.query('SELECT role FROM users WHERE id = ?', [decodedToken.uid], (error, results) => {
            if (error || results.length === 0) {
                // Si no está en nuestra BD, aún podemos dejarlo pasar, pero sin rol.
                // O podemos negarlo. Por ahora, lo dejamos pasar sin rol.
                // Para la función 'getMe' y otras, es crucial que el usuario exista en la BD.
                req.user.role = results.length > 0 ? results[0].role : 'student';
                return next();
            }
            // Si lo encontramos, añadimos el rol de nuestra BD
            req.user.role = results[0].role;
            next();
        });
    } catch (error) {
        console.error("Error verificando el token:", error);
        res.status(403).json({ message: 'Token no es válido.' });
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