const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRO DE USUARIO LOCAL ---
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese todos los campos.' });
    }

    try {
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Ese correo electrónico ya está en uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'student'
            }
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario.', error: error.message });
    }
};

// --- INICIO DE SESIÓN LOCAL ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese su correo y contraseña.' });
    }

    try {
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el inicio de sesión.', error: error.message });
    }
};

// --- OBTENER PERFIL DE USUARIO ---
exports.getMe = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil.', error: error.message });
  }
};
