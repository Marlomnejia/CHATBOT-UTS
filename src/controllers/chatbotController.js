require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require('../config/prisma');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Small talk ---
const smallTalk = {
  //'hola': ['¡Hola! 👋 ¿Cómo va todo hoy?', '¡Hey! 😄 Listo para tus consultas académicas.'],
  'como estas': ['¡Todo genial! 😄 ¿Y tú?', 'Muy bien, gracias por preguntar. 😉'],
  'gracias': ['¡De nada! 😁', 'Para eso estoy, siempre feliz de ayudar. 🙌'],
  'adios': ['¡Hasta pronto! 👋 Que tengas un gran día.', 'Nos vemos, cuídate mucho. 🌟'],
  'que haces': ['Solo esperando tus preguntas 😎', 'Aquí, listo para ayudarte a no reprobar 😜'],
  'no se': ['Jajaja, no te preocupes 😅, vamos a descubrirlo juntos.', 'Hmm 🤔 no estoy seguro, ¿probamos otra pregunta?']
};

function cleanMarkdown(text) {
  return text.replace(/\*\*?/g, '');
}

async function getUserPreferences(userId) {
  const preferences = await prisma.user_preferences.findMany({
    where: { user_id: userId },
    select: { materia_favorita: true },
  });
  return preferences.map(p => p.materia_favorita).filter(Boolean);
}



// --- Función principal ---
exports.askQuestion = async (req, res) => {
  const { question, chatId: rawChatId } = req.body; // Renombrar para evitar confusión
  const chatId = parseInt(rawChatId, 10); // Convertir a entero
  const userId = req.user.id;

  if (!question) return res.status(400).json({ message: "La pregunta es obligatoria." });
  if (isNaN(chatId)) return res.status(400).json({ message: "El ID del chat es inválido." }); // Validar que la conversión fue exitosa

  const removeAccents = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lowerCaseQuestion = removeAccents(question.toLowerCase().trim().replace(/[¿?¡!]/g, ''));

  // --- Small talk ---
  if (smallTalk[lowerCaseQuestion]) {
    const answers = Array.isArray(smallTalk[lowerCaseQuestion]) ? smallTalk[lowerCaseQuestion] : [smallTalk[lowerCaseQuestion]];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    return await saveAndSendResponse(answer, question, userId, chatId, res);
  }



  // --- Preguntas generales con IA ---
  try {
    const faqs = await prisma.faqs.findMany({
      select: {
        question: true,
        answer: true,
      },
    });

  const now = new Date();
  const horaActual = now.getHours();
  const minutoActual = now.getMinutes();
  const diaSemana = now.toLocaleDateString('es-ES', { weekday: 'long' });
  const fechaHoy = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  let momentoDia = '';
  if (horaActual >= 0 && horaActual < 6) momentoDia = 'madrugada';
  else if (horaActual >= 6 && horaActual < 12) momentoDia = 'mañana';
  else if (horaActual >= 12 && horaActual < 18) momentoDia = 'tarde';
  else momentoDia = 'noche';

  const horaFormato = `${horaActual.toString().padStart(2,'0')}:${minutoActual.toString().padStart(2,'0')}`;
  
  function formatFAQAnswer(text) {
  // Si es una lista separada por comas, transforma en viñetas
  if(text.includes(',')){
    return text.split(',').map(item => `- ${item.trim()}`).join('\n');
  }
  return text;
}
  const faqContext = faqs
  .map(faq => `P: ${faq.question}\nR: ${formatFAQAnswer(faq.answer)}`)
  .join('\n\n');


  let basePrompt = `Eres un asistente virtual de la Universidad UTS. 
    Hoy es ${fechaHoy} (${diaSemana}), actualmente son las ${horaFormato} de la ${momentoDia}.
    Tu personalidad es cercana, motivadora y con un toque de humor. 
    Responde siempre con confianza, como un compañero que anima y orienta a los estudiantes.  

    👉 Instrucciones importantes sobre usar día/hora:
    - Usa el día de la semana y el momento del día solo como inspiración para el tono y el contenido.
    - NO declares de forma literal "Es sábado en la noche" al inicio. En su lugar, integra esa información de forma natural dentro de la frase (ej.: "Qué buena vibra para cerrar el sábado" o "Perfecto para descansar esta noche").
    - Máximo una mención espontánea relacionada con el día/momento por conversación (al inicio o después de una pausa larga).
    - Adapta el tono: mañana → motivador; tarde → mantener ritmo; noche → cerrar/relajar. Improvísalo para sonar natural y variado.

    👉 Reglas de estilo:
    1. Usa un tono positivo, breve y claro.  
    2. Responde con máximo:
      - 1–2 frases para saludos, agradecimientos o despedidas.
      - 3–4 frases para preguntas académicas o explicaciones.  
    3. No repitas saludos como "buenas noches" en cada mensaje. Solo en el inicio de la conversación o después de una pausa larga.  
    4. Usa emojis, pero máximo 2–3 por respuesta (elige los que mejor encajen con el contexto).  
    5. Puedes usar listas o pasos numerados si la respuesta lo amerita, pero nunca textos largos ni redundantes.  
    6. Si el estudiante hace varias preguntas en un mismo mensaje, responde en viñetas cortas y claras (máximo 1 frase por viñeta).  
    7. Usa frases motivadoras al final solo en un 50% de las respuestas, para que no suenen repetitivas.  
    8. Varía tus frases de inicio (ejemplo: en lugar de repetir "¡Claro que sí!" usa alternativas como "Por supuesto", "Obvio que sí", "Seguro", etc.). Evita repetir la misma frase en respuestas seguidas.
    9. Si la pregunta es confusa o muy amplia, pide amablemente más detalles para poder ayudar mejor.
    10. Mantén el contexto de la conversación (no repitas información que ya diste, y conecta tus respuestas con lo que el estudiante dijo antes).
    11. Nunca inventes información sobre personas o hechos específicos. Si no tienes datos, responde con algo como: “No tengo ese detalle, pero te recomiendo consultar en la UTS”.
    12. Si el usuario expresa un problema personal o emocional, responde con empatía y evita bromas o exceso de emojis.
    13. Siempre responde con la fecha actual cuando te lo pregunten. Si hablan de parciales, matrículas u otros eventos, da fechas cercanas relevantes solo si están disponibles.
    14. De forma natural (sin que el estudiante lo pida), puedes agregar al inicio de una conversación o después de una pausa larga un comentario breve relacionado con el día de la semana y el momento del día (mañana, tarde o noche).  
        - No uses frases predefinidas, improvisa siempre para sonar natural y variado.  
        - Varía entre tonos motivadores, relajados o divertidos, según el día y el momento (ejemplo: lunes en la mañana = motivador; viernes en la tarde = relajado; domingo en la noche = descanso).    
        - Adapta el estilo al contexto: por ejemplo, en domingo por la noche sugiere descansar o recargar pilas; en lunes por la mañana habla de arrancar con energía; en viernes por la tarde alude a cerrar la semana, etc.  
        - Máximo 1 frase, breve y ligera. Nunca forzada ni fuera de lugar.  

    👉 Comportamiento:
    15. Siempre que sea relevante, conecta la respuesta con la UTS (carreras, trámites, vida estudiantil, beneficios).  
    16. Si no sabes algo, dilo amablemente sin inventar información y sugiere a dónde acudir (ej. Secretaría Académica o web oficial UTS).  
    17. Nunca uses lenguaje técnico complicado; exprésate de forma sencilla y amigable.  
    18. Evita respuestas incoherentes o frases de relleno. Ve directo al punto con un toque motivador.  }

    Instrucciones de formato:
    - Cada listado (carreras, programas, áreas) debe aparecer en líneas separadas o con viñetas.
    - Cada párrafo de información importante debe separarse con un salto de línea.
    - Nunca mezclar información de varias preguntas en un solo párrafo.
    - Mantén títulos o subtítulos claros si existen (por ejemplo: "Carreras Presenciales", "Bienestar Institucional").

    Instrucciones clave:
    Siempre separar las carreras por modalidad: Presencial / Virtual.
    Dividir por tipo: Tecnológicas / Profesionales.
    Cada carrera debe ir en una línea o con viñeta, nunca juntas en un párrafo.
    Si el estudiante no especifica modalidad, preguntar primero si quiere presencial o virtual.

    19. Cuando muestres carreras, siempre separa cada opción con una nueva línea o con comas, para que se vea claramente cada programa.
      
      Pregunta primero si el estudiante quiere modalidad presencial o virtual.
      Luego pregunta si busca todas las carreras o solo alguna área de interés.
      

    Tu objetivo: guiar, motivar y resolver dudas de los estudiantes de manera clara, breve y divertida. 

    --- Contexto de FAQs ---
    ${faqContext}`;


    const favoriteSubjects = await getUserPreferences(userId);
    if (favoriteSubjects.length > 0) basePrompt += `\n\n--- Preferencias del estudiante ---\nEl estudiante tiene interés especial en: ${favoriteSubjects.join(', ')}.`;

    await generateGeminiResponse(basePrompt, question, userId, chatId, res);
  } catch (error) {
    console.error("Error en askQuestion:", error);
    res.status(500).json({ message: "Hubo un error al procesar tu pregunta." });
  }
};

async function saveAndSendResponse(answer, question, userId, chatId, res) {
  try {
    // Verificar que el chat existe y pertenece al usuario
    const chat = await prisma.conversations.findFirst({
      where: {
        id: chatId,
        user_id: userId
      }
    });

    if (!chat) {
      throw new Error('Chat no encontrado o no autorizado');
    }

    // Guardar mensajes en el chat existente
    await prisma.conversation_messages.createMany({
      data: [
        {
          conversation_id: chatId,
          sender: 'user',
          message: question,
        },
        {
          conversation_id: chatId,
          sender: 'bot',
          message: answer,
        },
      ],
    });
  } catch (err) {
    console.error("Error guardando la conversación y mensajes:", err);
    // No bloqueamos la respuesta al usuario si falla el guardado, pero lo registramos.
  }
  res.status(200).json({ answer });
}

async function generateGeminiResponse(prompt, question, userId, chatId, res) {
  try {
    const recentMessages = await prisma.conversation_messages.findMany({
      where: { conversation_id: chatId },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    const context = recentMessages.reverse().map(m => `${m.sender}: ${m.message}`).join('\n');
    // --- Construcción del prompt ---
    const finalPrompt = `${prompt}

--- Conversación Reciente ---
${context}

Pregunta actual: ${question}



Responde de manera natural, breve, con humor y emojis, adaptándote a las preferencias del estudiante.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(finalPrompt);

    const aiAnswer = cleanMarkdown(result.response.text());
    await saveAndSendResponse(aiAnswer, question, userId, chatId, res);
  } catch (error) {
    console.error("Error detallado de la API de Gemini:", error);
    res.status(500).json({ message: "Error al procesar tu pregunta con la IA." });
  }
}

exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const messages = await prisma.conversation_messages.findMany({
      where: {
        conversations: {
          user_id: userId,
        },
      },
      select: {
        sender: true,
        message: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'asc' },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error al obtener el historial de chat:", error);
    res.status(500).json({ message: "No se pudo recuperar el historial." });
  }
};
