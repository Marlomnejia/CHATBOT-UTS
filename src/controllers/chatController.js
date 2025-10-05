const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los chats de un usuario
const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await prisma.conversations.findMany({
            where: {
                user_id: userId
            },
            include: {
                conversation_messages: {
                    take: 1,
                    orderBy: {
                        timestamp: 'desc'
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        
        res.json(chats);
    } catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(500).json({ error: 'Error al obtener los chats' });
    }
};

// Crear un nuevo chat
const createChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const newChat = await prisma.conversations.create({
            data: {
                user_id: userId
            }
        });
        
        res.json(newChat);
    } catch (error) {
        console.error('Error al crear el chat:', error);
        res.status(500).json({ error: 'Error al crear el chat' });
    }
};

// Eliminar un chat
const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Verificar que el chat pertenezca al usuario
        const chat = await prisma.conversations.findFirst({
            where: {
                id: parseInt(chatId),
                user_id: userId
            }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat no encontrado' });
        }

        // Eliminar el chat y sus mensajes (la eliminación en cascada está configurada en el schema)
        await prisma.conversations.delete({
            where: {
                id: parseInt(chatId)
            }
        });

        res.json({ message: 'Chat eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el chat:', error);
        res.status(500).json({ error: 'Error al eliminar el chat' });
    }
};

// Eliminar todos los chats de un usuario
const deleteAllChats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Eliminar todos los chats del usuario
        await prisma.conversations.deleteMany({
            where: {
                user_id: userId,
            },
        });

        res.json({ message: 'Todos los chats han sido eliminados.' });
    } catch (error) {
        console.error('Error al eliminar todos los chats:', error);
        res.status(500).json({ error: 'Error al eliminar todos los chats.' });
    }
};

// Obtener los mensajes de un chat específico
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Verificar que el chat pertenezca al usuario
        const chat = await prisma.conversations.findFirst({
            where: {
                id: parseInt(chatId),
                user_id: userId
            },
            include: {
                conversation_messages: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat no encontrado' });
        }

        res.json(chat.conversation_messages);
    } catch (error) {
        console.error('Error al obtener los mensajes del chat:', error);
        res.status(500).json({ error: 'Error al obtener los mensajes del chat' });
    }
};

module.exports = {
    getUserChats,
    createChat,
    deleteChat,
    deleteAllChats,
    getChatMessages
};