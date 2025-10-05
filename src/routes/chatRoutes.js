const express = require('express');
const router = express.Router();
const { getUserChats, createChat, deleteChat, deleteAllChats, getChatMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(protect);

// Obtener todos los chats del usuario
router.get('/', getUserChats);

// Crear un nuevo chat
router.post('/', createChat);

// Eliminar todos los chats del usuario
router.delete('/', deleteAllChats);

// Eliminar un chat específico
router.delete('/:chatId', deleteChat);

// Obtener los mensajes de un chat específico
router.get('/:chatId/messages', getChatMessages);

module.exports = router;