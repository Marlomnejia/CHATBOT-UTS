const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Importamos nuestro middleware

// Esta ruta estará protegida.
// El middleware 'protect' se ejecutará antes de la función del controlador.
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    message: '¡Has accedido a una ruta protegida!',
    user: req.user // Enviamos de vuelta la info del usuario que adjuntó el middleware
  });
});

module.exports = router;