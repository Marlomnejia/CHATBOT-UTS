require('dotenv').config();
const express = require('express');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Importar todas las rutas
const authRoutes = require('./routes/authRoutes');
const faqRoutes = require('./routes/faqRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const academicRoutes = require('./routes/academicRoutes');

// Usar todas las rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/academic', academicRoutes);

// --- NUEVA RUTA DE REDIRECCIÓN ---
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 🚀 Escuchar en el puerto correcto (Render asigna uno dinámicamente)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
