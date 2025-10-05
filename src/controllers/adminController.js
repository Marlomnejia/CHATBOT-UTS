const prisma = require('../config/prisma');

module.exports = {
  getTopQuestions: async (req, res) => {
    try {
      const topQuestions = await prisma.conversation_messages.groupBy({
        by: ['message'],
        where: {
          sender: 'user',
        },
        _count: {
          message: true,
        },
        orderBy: {
          _count: {
            message: 'desc',
          },
        },
        take: 10,
      });

      const formattedQuestions = topQuestions.map(q => ({
        message: q.message,
        count: q._count.message
      }));

      res.status(200).json(formattedQuestions);
    } catch (error) {
      console.error("Error al obtener las analíticas:", error);
      res.status(500).json({ message: 'Error al consultar las analíticas.' });
    }
  },

  getUserActivity: async (req, res) => {
    try {
        const conversations = await prisma.conversations.findMany({
            where: {
                user_id: {
                    not: null
                }
            },
            include: {
                _count: {
                    select: { conversation_messages: true }
                }
            }
        });

        const userActivity = conversations.reduce((acc, conv) => {
            const userId = conv.user_id;
            const messageCount = conv._count.conversation_messages;
            
            if (!acc[userId]) {
                acc[userId] = { user_id: userId, messages_sent: 0 };
            }
            acc[userId].messages_sent += messageCount;
            
            return acc;
        }, {});

        const sortedActivity = Object.values(userActivity)
            .sort((a, b) => b.messages_sent - a.messages_sent)
            .slice(0, 10);

      res.status(200).json(sortedActivity);
    } catch (error) {
      console.error("Error al obtener la actividad de usuarios:", error);
      res.status(500).json({ message: 'Error al consultar la actividad de usuarios.' });
    }
  }
};