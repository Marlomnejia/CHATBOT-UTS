const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js'); // Importamos nuestro middleware
const prisma = require('../config/prisma.js');

// Esta ruta estará protegida.
// El middleware 'protect' se ejecutará antes de la función del controlador.
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    message: '¡Has accedido a una ruta protegida!',
    user: req.user // Enviamos de vuelta la info del usuario que adjuntó el middleware
  });
});

// Ruta para probar la conexión con la base de datos y Prisma
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

module.exports = router;
