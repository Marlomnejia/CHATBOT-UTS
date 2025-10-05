let currentChatId = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', async () => {
    authToken = localStorage.getItem('authToken');

    if (!authToken) {
        console.warn("No hay token en localStorage");
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Token inválido');

        const user = await response.json();

        if (user.role === 'admin') {
            window.location.href = '/admin.html';
            return;
        } else if (user.role === 'student') {
            initializeChat(user);
        } else {
            throw new Error('Rol desconocido');
        }

    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
});

// --- Inicialización del chat ---
function initializeChat(user) {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const logoutBtn = document.getElementById('logout-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const deleteAllChatsBtn = document.getElementById('delete-all-chats-btn');

    loadInitialChat(); // MODIFIED

    newChatBtn.addEventListener('click', createNewChat);
    deleteAllChatsBtn.addEventListener('click', deleteAllChats);

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentChatId'); // ADDED
        window.location.href = '/login.html';
    });

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = userInput.value.trim();
        if (!question) return;

        if (!currentChatId) {
            // This should ideally not happen if loadInitialChat works correctly
            await createNewChat();
        }

        userInput.value = '';
        handleUserQuestion(question);
    });

    document.body.classList.add('dark-mode');
}

// --- NEW FUNCTION ---
async function loadInitialChat() {
    await loadChats(); // This populates the sidebar

    const chatList = document.getElementById('chat-list');
    const savedChatId = localStorage.getItem('currentChatId');

    let savedChatIsValid = false;
    if (savedChatId) {
        const savedChatItem = chatList.querySelector(`.delete-chat[data-chat-id='${savedChatId}']`);
        if (savedChatItem) {
            savedChatIsValid = true;
        }
    }

    if (savedChatIsValid) {
        selectChat(savedChatId);
    } else if (chatList.children.length > 0) {
        const firstChatElement = chatList.children[0];
        const firstChatId = firstChatElement.querySelector('.delete-chat').dataset.chatId;
        selectChat(firstChatId);
    } else {
        createNewChat();
    }
}


// --- Cargar chats ---
async function loadChats() {
    try {
        const response = await fetch('/api/chats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const chats = await response.json();

        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';

        chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item';
            // currentChatId might not be set yet, so we check against localStorage
            if (chat.id == localStorage.getItem('currentChatId')) {
                chatElement.classList.add('active');
            }

            const previewText = chat.conversation_messages[0]?.message || 'Nuevo chat';
            chatElement.innerHTML = `
                <div class="chat-preview">
                    <span class="chat-date">${new Date(chat.created_at).toLocaleDateString()}</span>
                    <p class="chat-message-preview">${previewText.substring(0, 30)}...</p>
                </div>
                <button class="delete-chat" data-chat-id="${chat.id}">×</button>
            `;

            chatElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-chat')) {
                    selectChat(chat.id);
                }
            });

            chatList.appendChild(chatElement);
        });

        // Eventos para eliminar chats
        document.querySelectorAll('.delete-chat').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const chatId = e.target.dataset.chatId;
                await deleteChat(chatId);
            });
        });
    } catch (error) {
        console.error('Error al cargar los chats:', error);
    }
}

// --- Crear nuevo chat ---
async function createNewChat() {
    try {
        const response = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const newChat = await response.json();
        currentChatId = newChat.id;
        localStorage.setItem('currentChatId', currentChatId); // MODIFIED

        await loadChats();
        clearChatMessages();

        addMessage('👋 ¡Hola! Soy el asistente académico de la UTS. ¿En qué puedo ayudarte hoy?', 'bot');
        
    } catch (error) {
        console.error('Error al crear nuevo chat:', error);
    }
}

// --- Eliminar chat ---
async function deleteChat(chatId) {
    if (confirm('¿Estás seguro de que deseas eliminar este chat?')) {
        try {
            await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (currentChatId == chatId) {
                localStorage.removeItem('currentChatId'); // MODIFIED
                currentChatId = null;
                await loadInitialChat(); // MODIFIED - to load next available chat or create new
            } else {
                await loadChats();
            }
        } catch (error) {
            console.error('Error al eliminar el chat:', error);
        }
    }
}

// --- Eliminar todos los chats ---
async function deleteAllChats() {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los chats? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch('/api/chats', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar los chats.');
            }
            
            localStorage.removeItem('currentChatId'); // MODIFIED
            currentChatId = null; // MODIFIED

            // Reset the chat interface by creating a new chat
            await createNewChat();

        } catch (error) {
            console.error('Error al eliminar todos los chats:', error);
            alert('Hubo un error al intentar eliminar los chats.');
        }
    }
}

// --- Seleccionar chat ---
async function selectChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId); // MODIFIED

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    // Add active class to the selected chat in the list
    const selectedChatItem = document.querySelector(`.delete-chat[data-chat-id='${chatId}']`);
    if (selectedChatItem) {
        selectedChatItem.closest('.chat-item').classList.add('active');
    }

    await loadChatMessages(chatId);
}

// --- Limpiar mensajes ---
function clearChatMessages() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
}

// --- Cargar mensajes ---
async function loadChatMessages(chatId) {
    try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const messages = await response.json();
        clearChatMessages();

        if (messages.length === 0) {
            // This is a new or empty chat, show welcome message
            addMessage('👋 ¡Hola! Soy el asistente académico de la UTS. ¿En qué puedo ayudarte hoy?', 'bot');
            
        } else {
            // This chat has history, display it
            messages.forEach(msg => addMessage(msg.message, msg.sender));
        }
    } catch (error) {
        console.error('Error al cargar los mensajes:', error);
    }
}

// --- Manejar preguntas ---
async function handleUserQuestion(question) {
    // Actualizar la vista previa del chat si es el primer mensaje
    const chatItem = document.querySelector(`.delete-chat[data-chat-id='${currentChatId}']`)?.closest('.chat-item');
    if (chatItem) {
        const previewElement = chatItem.querySelector('.chat-message-preview');
        if (previewElement && previewElement.textContent.startsWith('Nuevo chat')) {
            updateChatPreview(currentChatId, question);
        }
    }

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
            body: JSON.stringify({ chatId: currentChatId, question })
        });

        if (!response.ok) throw new Error('Error al procesar la pregunta');

        const data = await response.json();
        addMessage(data.answer, 'bot');
        // No need to reload all chats, just update the preview of the current one
        // await loadChats(); 
    } catch (error) {
        addMessage(`❌ Error: ${error.message}`, 'bot');
    } finally {
        document.getElementById('typing-indicator')?.remove();
    }
}

// --- Añadir mensaje al chat --- 
function addMessage(content, sender, id) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    if (id) messageElement.id = id;
    messageElement.classList.add('message', `${sender}-message`);

    if (sender === 'indicator') {
        messageElement.innerHTML = content;
    } else {
        messageElement.innerHTML = content.replace(/\n/g, '<br>');
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- NEW FUNCTION to update chat preview ---
function updateChatPreview(chatId, text) {
   const chatItem = document.querySelector(`.delete-chat[data-chat-id='${chatId}']`)?.closest('.chat-item');
   if (chatItem) {
       const previewElement = chatItem.querySelector('.chat-message-preview');
       if (previewElement) {
           previewElement.textContent = text.substring(0, 30) + '...';
       }
   }
}
