const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

// Llamado por el frontend DESPUÉS de un registro exitoso en Firebase
exports.createUserRecord = (req, res) => {
    const { uid, name, email } = req.body;
    if (!uid || !name || !email) {
        return res.status(400).json({ message: 'Faltan datos para crear el registro.' });
    }
    const newUser = { id: uid, name, email, role: 'student' };
    db.query('INSERT INTO users SET ?', newUser, (error) => {
        if (error) {
            console.error("Error guardando usuario en MySQL:", error);
            return res.status(500).json({ message: 'Error al guardar el registro del usuario.' });
        }
        res.status(201).json({ message: 'Registro de usuario completado.' });
    });
};

// Llamado por el frontend DESPUÉS de un login con Google exitoso
exports.googleSignIn = (req, res) => {
    // El middleware ya extrajo la info del token de Firebase en req.user
    const { uid, name, email } = req.user;
    db.query('SELECT * FROM users WHERE id = ?', [uid], (error, results) => {
        if (error) return res.status(500).json({ message: "Error en la base de datos." });
        if (results.length > 0) {
            return res.status(200).json({ message: "Inicio de sesión con Google exitoso." });
        } else {
            const newUser = { id: uid, name, email, role: 'student' };
            db.query('INSERT INTO users SET ?', newUser, (err) => {
                if (err) return res.status(500).json({ message: "Error al registrar al usuario de Google." });
                return res.status(201).json({ message: "Usuario de Google registrado exitosamente." });
            });
        }
    });
};

// Obtiene los datos del usuario logueado
exports.getMe = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (error, results) => {
    if (error || results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(results[0]);
  });
};