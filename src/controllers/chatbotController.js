const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');
const scraperService = require('../services/scraperService');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cache = {};
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora

const smallTalk = {
  'hola': '¡Hola! ¿En qué puedo ayudarte hoy?',
  'como estas': '¡Muy bien! Funcionando al 100% y listo para tus consultas académicas.',
  'cómo estás': '¡Muy bien! Funcionando al 100% y listo para tus consultas académicas.',
  'gracias': '¡De nada! Estoy aquí para servirte.',
  'muchas gracias': '¡De nada! Estoy aquí para servirte.',
  'adios': '¡Hasta pronto! Que tengas un excelente día.',
  'chao': '¡Hasta pronto! Que tengas un excelente día.'
};

exports.askQuestion = async (req, res) => {
  const { question } = req.body;
  const userId = req.user.id;
  if (!question) return res.status(400).json({ message: "La pregunta es obligatoria." });

  const lowerCaseQuestion = question.toLowerCase().trim().replace(/[¿?¡!]/g, '');
  if (smallTalk[lowerCaseQuestion]) {
    const answer = smallTalk[lowerCaseQuestion];
    saveAndSendResponse(answer, question, userId, res);
    return;
  }

  try {
    db.query('SELECT question, answer FROM faqs', async (error, faqs) => {
      if (error) return res.status(500).json({ message: "Error al consultar FAQs." });

      let faqContext = faqs.map(faq => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n');
      let basePrompt = `Eres un asistente virtual de la Universidad UTS. Tu deber es responder las preguntas de los estudiantes basándote estricta y únicamente en el contexto que se te proporciona. Si la respuesta no se encuentra en el contexto, debes indicar amablemente que no tienes esa información. No inventes respuestas.\n\n--- Contexto de Preguntas Frecuentes ---\n${faqContext}`;

      const missionKeywords = ['misión', 'vision', 'proposito'];
      const calendarKeywords = ['calendario', 'fechas', 'semestre'];
      const newsKeywords = ['noticias', 'novedades', 'último'];
      const gradesKeywords = ['notas', 'calificaciones', 'rendimiento', 'como voy', 'cómo voy', 'materias'];

      const isMissionQuestion = missionKeywords.some(k => lowerCaseQuestion.includes(k));
      const isCalendarQuestion = calendarKeywords.some(k => lowerCaseQuestion.includes(k));
      const isNewsQuestion = newsKeywords.some(k => lowerCaseQuestion.includes(k));
      const isGradesQuestion = gradesKeywords.some(k => lowerCaseQuestion.includes(k));

      if (isGradesQuestion) {
        try {
          const token = req.headers.authorization;
          const gradesResponse = await axios.get('http://localhost:3000/api/academic/grades', {
            headers: { 'Authorization': token }
          });
          const grades = gradesResponse.data;
          let gradesContext;

          if (grades.length === 0) {
            gradesContext = "El estudiante no tiene notas registradas para el semestre actual.";
          } else {
            gradesContext = "Aquí está tu rendimiento académico:\n" + grades.map(g => 
              `- Materia: ${g.materia}, Corte 1: ${g.corte1}, Corte 2: ${g.corte2}, Corte 3: ${g.corte3}, Definitiva: ${g.definitiva}`
            ).join('\n');
          }
          const finalPrompt = `${basePrompt}\n\n--- Contexto de Notas del Estudiante ---\n${gradesContext}`;
          return generateGeminiResponse(finalPrompt, question, userId, res);
        } catch (apiError) {
          console.error("Error al llamar a la API de notas interna:", apiError.message);
          return saveAndSendResponse("Tuve un problema al consultar tus notas en este momento. Por favor, inténtalo de nuevo más tarde.", question, userId, res);
        }
      }

      let info;
      let cacheKey;
      let contextTitle = 'Contexto Externo';

      if (isNewsQuestion) {
        info = "Lo siento, la función de noticias no está disponible en este momento. Intenta de nuevo más tarde.";
      } else if (isMissionQuestion) {
        cacheKey = 'missionVision';
        contextTitle = 'Contexto Institucional';
      } else if (isCalendarQuestion) {
        cacheKey = 'academicCalendar';
        contextTitle = 'Contexto de Calendario Académico';
      }

      if (cacheKey && cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION_MS)) {
        console.log(`✅ Usando datos desde el caché para: ${cacheKey}`);
        info = cache[cacheKey].data;
      } else if (cacheKey) {
        console.log(`🔄 Realizando scraping en tiempo real para: ${cacheKey}`);
        if (isMissionQuestion) info = await scraperService.scrapeUtsMissionVision();
        if (isCalendarQuestion) info = await scraperService.scrapeAcademicCalendar();
        if (info && !info.includes("Hubo un error")) {
          cache[cacheKey] = { data: info, timestamp: Date.now() };
        }
      }

      if (info) {
        if (info.includes("Hubo un error")) return res.status(200).json({ answer: info });
        const truncatedInfo = info.substring(0, 4000);
        const finalPrompt = `${basePrompt}\n\n--- ${contextTitle} ---\n${truncatedInfo}`;
        return generateGeminiResponse(finalPrompt, question, userId, res);
      } else {
        return generateGeminiResponse(basePrompt, question, userId, res);
      }
    });
  } catch (error) {
    console.error("Error en askQuestion:", error);
    res.status(500).json({ message: "Hubo un error al procesar tu pregunta." });
  }
};

function saveAndSendResponse(answer, question, userId, res) {
    db.query('INSERT INTO conversations SET ?', { user_id: userId }, (err, convResult) => {
      if (err) return console.error("Error guardando la conversación:", err);
      const conversationId = convResult.insertId;
      db.query('INSERT INTO conversation_messages SET ?', { conversation_id: conversationId, sender: 'user', message: question });
      db.query('INSERT INTO conversation_messages SET ?', { conversation_id: conversationId, sender: 'bot', message: answer });
    });
    res.status(200).json({ answer });
}

async function generateGeminiResponse(prompt, question, userId, res) {
  try {
    const finalPromptWithQuestion = `${prompt}\n\n--- Pregunta del Estudiante ---\n${question}`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(finalPromptWithQuestion);
    const aiAnswer = result.response.text();
    saveAndSendResponse(aiAnswer, question, userId, res);
  } catch (error) {
    console.error("Error detallado de la API de Gemini:", error);
    res.status(500).json({ message: "Error: Hubo un error al procesar tu pregunta con la IA." });
  }
}

exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT cm.sender, cm.message, cm.timestamp
    FROM conversation_messages cm
    JOIN conversations c ON cm.conversation_id = c.id
    WHERE c.user_id = ?
    ORDER BY cm.timestamp ASC
  `;
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error al obtener el historial de chat:", error);
      return res.status(500).json({ message: "No se pudo recuperar el historial." });
    }
    res.status(200).json(results);
  });
};