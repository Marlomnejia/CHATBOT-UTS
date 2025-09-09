document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el token de autenticación del almacenamiento local
    const authToken = localStorage.getItem('authToken');

    // 2. Si no hay token, redirigir al login
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }

    // 3. Verificar el token y obtener los datos del usuario
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Sesión inválida.');
        }

        const user = await response.json();
        console.log("Usuario autenticado:", user);

        // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
        const chatBox = document.getElementById('chat-box');
        const chatForm = document.getElementById('chat-form');
        const userInput = document.getElementById('user-input');
        const logoutBtn = document.getElementById('logout-btn');
        const welcomeMessage = document.getElementById('welcome-message');

        welcomeMessage.textContent = `¡Hola, ${user.name}! Bienvenido al asistente académico.`;
        await loadChatHistory(authToken);

        // --- MANEJO DE LA SALIDA DE SESIÓN ---
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        });

        // --- MANEJO DEL ENVÍO DEL MENSAJE DEL USUARIO ---
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const question = userInput.value.trim();
            if (!question) return;
            userInput.value = '';
            document.querySelector('.suggestion-container')?.remove();
            handleUserQuestion(question);
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
        headers: {
            'Authorization': `Bearer ${token}`
        }
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
            handleUserQuestion(text);
            container.remove();
        };
        container.appendChild(btn);
    });
    chatBox.appendChild(container);
}

async function handleUserQuestion(question) {
    const userInput = document.getElementById('user-input');
    const authToken = localStorage.getItem('authToken');
    addMessage(question, 'user');
    const indicatorHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    addMessage(indicatorHTML, 'indicator', 'typing-indicator');
    try {
        const response = await fetch('/api/chat/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
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
