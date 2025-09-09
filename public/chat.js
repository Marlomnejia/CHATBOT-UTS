// src/public/js/chat.js
document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Sesión inválida.');

        const user = await response.json();
        console.log("Usuario autenticado:", user);

        const chatBox = document.getElementById('chat-box');
        const chatForm = document.getElementById('chat-form');
        const userInput = document.getElementById('user-input');
        const logoutBtn = document.getElementById('logout-btn');
        const welcomeMessage = document.getElementById('welcome-message');

        welcomeMessage.textContent = `¡Hola, ${user.name}! Bienvenido al asistente académico.`;
        await loadChatHistory(authToken);

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        });

        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const question = userInput.value.trim();
            if (!question) return;
            userInput.value = '';
            document.querySelector('.suggestion-container')?.remove();
            handleUserQuestion(question, authToken);
        });

    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        alert("Sesión inválida. Por favor, inicia sesión de nuevo.");
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
});

async function loadChatHistory(token) {
    const chatBox = document.getElementById('chat-box');
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

function addMessage(content, sender, id) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    if (id) messageElement.id = id;
    messageElement.classList.add('message', `${sender}-message`);

    if (sender === 'indicator') {
        messageElement.innerHTML = content;
    } else {
        messageElement.textContent = content;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displaySuggestedQuestions() {
    const chatBox = document.getElementById('chat-box');
    const suggestions = ['¿Cuáles son las últimas noticias?', 'Ver calendario académico', '¿Cuáles son las carreras?'];
    const container = document.createElement('div');
    container.className = 'suggestion-container';
    suggestions.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = text;
        btn.onclick = () => {
            handleUserQuestion(text, localStorage.getItem('authToken'));
            container.remove();
        };
        container.appendChild(btn);
    });
    chatBox.appendChild(container);
}

async function handleUserQuestion(question, token) {
    addMessage(question, 'user');
    addMessage(`<div class="typing-indicator"><span></span><span></span><span></span></div>`, 'indicator', 'typing-indicator');

    try {
        const response = await fetch('/api/chat/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
