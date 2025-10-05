const jwt = require('jsonwebtoken');

// Middleware para proteger rutas verificando nuestro propio JWT
exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }
    
    const token = authHeader.split(' ')[1]; // <-- aquí estaba el problema
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no es válido.' });
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
