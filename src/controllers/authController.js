// src/controllers/authController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Función para manejar el inicio de sesión
exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (error, results) => {
        if (error) {
            console.error("Error en la base de datos:", error);
            return res.status(500).json({ message: 'Error en el servidor.' });
        }

        const user = results[0];
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // TODO: Comparar contraseña encriptada en producción

        // Generar JWT real
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
    });
};

// Función para obtener datos del usuario autenticado
exports.getMe = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autenticado." });
    }

    const userId = req.user.id;
    db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json(results[0]);
    });
};
