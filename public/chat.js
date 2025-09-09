// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

async function initializeChat() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  try {
    const profileResponse = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!profileResponse.ok) throw new Error('Sesión inválida.');
    const profileData = await profileResponse.json();
    welcomeMessage.textContent = `¡Hola, ${profileData.name}! Bienvenido al asistente académico.`;
    await loadChatHistory(token);
  } catch (error) {
    console.error(error.message);
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
  }
}

async function loadChatHistory(token) {
  const response = await fetch('/api/chat/history', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const history = await response.json();
  chatBox.innerHTML = '';
  addMessage('¡Hola! Soy el asistente académico de la UTS. ¿En qué puedo ayudarte hoy?', 'bot');
  if (history.length > 0) {
    history.forEach(msg => addMessage(msg.message, msg.sender));
  } else {
    displaySuggestedQuestions();
  }
}

/**
 * --- FUNCIÓN CORREGIDA ---
 * Añade un mensaje a la ventana de chat.
 * @param {string} content - El texto o elemento HTML del mensaje.
 * @param {string} sender - 'user', 'bot', o 'indicator'.
 * @param {string} [id] - Un ID opcional para el elemento.
 */
function addMessage(content, sender, id) {
  const messageElement = document.createElement('div');
  if (id) messageElement.id = id;
  messageElement.classList.add('message', `${sender}-message`);
  
  // Si el contenido es para el indicador, lo trata como HTML.
  // Para todo lo demás, lo trata como texto para evitar problemas de seguridad.
  if (sender === 'indicator') {
    messageElement.innerHTML = content;
  } else {
    messageElement.textContent = content;
  }
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function displaySuggestedQuestions() {
    const suggestions = ['¿Cuáles son las últimas noticias?', 'Ver calendario académico', '¿Cuáles son las carreras?'];
    const container = document.createElement('div');
    container.className = 'suggestion-container';
    suggestions.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = text;
        btn.onclick = () => {
            handleUserQuestion(text);
            container.remove();
        };
        container.appendChild(btn);
    });
    chatBox.appendChild(container);
}

async function handleUserQuestion(question) {
  addMessage(question, 'user');
  const indicatorHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
  addMessage(indicatorHTML, 'indicator', 'typing-indicator'); // <- Pequeño ajuste aquí también
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ question })
    });
    if (!response.ok) throw new Error((await response.json()).message);
    const data = await response.json();
    addMessage(data.answer, 'bot');
  } catch (error) {
    addMessage(`Error: ${error.message}`, 'bot');
  } finally {
    document.getElementById('typing-indicator')?.remove();
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;
  userInput.value = '';
  document.querySelector('.suggestion-container')?.remove();
  handleUserQuestion(question);
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
});

initializeChat();