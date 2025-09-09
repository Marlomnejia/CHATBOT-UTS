// --- ELEMENTOS DEL DOM ---
const faqListBody = document.getElementById('faq-list');
const createForm = document.getElementById('create-faq-form');
const logoutBtn = document.getElementById('logout-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-faq-form');

// --- CÓDIGO DE INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
});

async function initializeAdminPanel() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    // Si no hay token o userId, no hay acceso.
    if (!token || !userId) {
        alert('Sesión inválida. Por favor, inicia sesión de nuevo.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const user = await verifyAdmin(token, userId);
        if (user.role === 'admin') {
            loadFaqs(token, userId);
        } else {
            alert('Acceso denegado. Se requiere rol de administrador.');
            window.location.href = '/chat.html';
        }
    } catch (error) {
        alert(error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        window.location.href = '/login.html';
    }
}

async function verifyAdmin(token, userId) {
    const response = await fetch('/api/auth/me', { 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
        } 
    });
    if (!response.ok) {
        throw new Error('Sesión inválida.');
    }
    return await response.json();
}

// --- LÓGICA CRUD ---
async function loadFaqs(token, userId) {
    const response = await fetch('/api/faqs', { 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
        } 
    });
    const faqs = await response.json();
    faqListBody.innerHTML = '';
    faqs.forEach(faq => {
        const row = document.createElement('tr');
        row.dataset.id = faq.id;
        row.dataset.question = faq.question;
        row.dataset.answer = faq.answer;
        row.innerHTML = `
            <td>${faq.question}</td>
            <td class="faq-answer">${faq.answer}</td>
            <td>
                <div class="action-icons">
                    <span class="material-icons edit-icon" title="Editar">edit</span>
                    <span class="material-icons delete-icon" title="Eliminar">delete</span>
                </div>
            </td>
        `;
        faqListBody.appendChild(row);
    });
}

// Event listener único para la tabla (más robusto)
faqListBody.addEventListener('click', (event) => {
    const target = event.target;
    const row = target.closest('tr');
    if (!row) return;

    if (target.classList.contains('delete-icon')) {
        deleteFaq(row.dataset.id);
    }
    if (target.classList.contains('edit-icon')) {
        openEditModal(row.dataset.id, row.dataset.question, row.dataset.answer);
    }
});

createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const question = event.target.question.value;
    const answer = event.target.answer.value;
    
    await fetch('/api/faqs', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
        },
        body: JSON.stringify({ question, answer })
    });
    
    createForm.reset();
    document.querySelector('.create-faq-accordion').open = false;
    loadFaqs(token, userId);
});

async function deleteFaq(id) {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (!confirm('¿Estás seguro de que quieres eliminar esta FAQ?')) return;
    
    await fetch(`/api/faqs/${id}`, { 
        method: 'DELETE', 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
        } 
    });
    
    loadFaqs(token, userId);
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
});

// --- FUNCIONES PARA EL MODAL ---
function openEditModal(id, question, answer) {
    editForm.elements['edit-faq-id'].value = id;
    editForm.elements['edit-question'].value = question;
    editForm.elements['edit-answer'].value = answer;
    editModal.classList.add('visible');
}

function closeEditModal() {
    editModal.classList.remove('visible');
}

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const id = editForm.elements['edit-faq-id'].value;
    const question = editForm.elements['edit-question'].value;
    const answer = editForm.elements['edit-answer'].value;
    
    await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
        },
        body: JSON.stringify({ question, answer })
    });
    
    closeEditModal();
    loadFaqs(token, userId);
});