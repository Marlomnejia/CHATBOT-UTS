const db = require('../config/db');

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
        // TODO: En un sistema real, aquí debes comparar la contraseña encriptada.
        res.status(200).json({ message: 'Inicio de sesión exitoso.', token: 'simulated-token-123', userId: user.id });
    });
};

// Función para manejar el registro de usuarios
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Faltan datos para el registro.' });
    }
    
    try {
        // TODO: Hashear la contraseña antes de guardarla.
        const newUser = { name, email, password, role: 'student' };
        
        const query = 'INSERT INTO users SET ?';
        db.query(query, newUser, (error) => {
            if (error) {
                console.error("Error guardando usuario en MySQL:", error);
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
                }
                return res.status(500).json({ message: 'Error al registrar el usuario.' });
            }
            res.status(201).json({ message: 'Registro exitoso.' });
        });
    } catch (error) {
        console.error("Error en la lógica de registro:", error);
        res.status(500).json({ message: 'Hubo un error al procesar tu solicitud.' });
    }
};

// Esta función se encarga de crear el registro de un nuevo usuario
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

// Obtiene los datos del usuario actualmente autenticado.
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