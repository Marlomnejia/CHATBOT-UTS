const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

// Llamado por el frontend DESPUÉS de un registro exitoso en Firebase
exports.createUserRecord = (req, res) => {
    const { uid, name, email } = req.user;
    const newUser = { id: uid, name, email, role: 'student' };
    db.query('INSERT INTO users SET ?', newUser, (error) => {
        if (error) {
            console.error("Error guardando usuario en MySQL:", error);
            admin.auth().deleteUser(uid);
            return res.status(500).json({ message: 'Error al guardar el registro del usuario.' });
        }
        res.status(201).json({ message: 'Registro de usuario completado.' });
    });
};

// Llamado por el frontend DESPUÉS de un login con Google
exports.googleSignIn = (req, res) => {
    const { uid, name, email } = req.user;
    console.log('googleSignIn: uid:', uid, 'name:', name, 'email:', email);
    db.query('SELECT * FROM users WHERE id = ?', [uid], (error, results) => {
        console.log('Resultado de SELECT en googleSignIn:', results, 'Error:', error);
        if (error) {
            console.error('Error en la consulta SELECT:', error);
            return res.status(500).json({ message: "Error en la base de datos.", error });
        }
        if (results.length > 0) {
            console.log('Usuario ya existe en la BD.');
            return res.status(200).json({ message: "Inicio de sesión con Google exitoso." });
        } else {
            const newUser = { id: uid, name, email, role: 'student' };
            console.log('Intentando insertar nuevo usuario:', newUser);
            db.query('INSERT INTO users SET ?', newUser, (err, insertResult) => {
                if (err) {
                    console.error('Error al registrar al usuario de Google:', err);
                    return res.status(500).json({ message: "Error al registrar al usuario de Google.", error: err });
                }
                console.log('Usuario de Google registrado exitosamente:', insertResult);
                return res.status(201).json({ message: "Usuario de Google registrado exitosamente." });
            });
        }
    });
};

// Obtiene los datos del usuario logueado
exports.getMe = (req, res) => {
        const userId = req.user.uid;
    console.log('Buscando usuario en la BD con id:', userId);
    db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (error, results) => {
        console.log('Resultado de la consulta:', results, 'Error:', error);
        if (error || results.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json(results[0]);
    });
};