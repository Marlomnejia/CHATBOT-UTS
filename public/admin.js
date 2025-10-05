const faqListBody = document.getElementById('faq-list');
const createForm = document.getElementById('create-faq-form');
const logoutBtn = document.getElementById('logout-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-faq-form');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const searchFaqInput = document.getElementById('search-faq');

let allFaqs = []; // Store all FAQs

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Sesión inválida. Por favor, inicia sesión.');
        window.location.href = '/login.html';
        return;
    }

    try {
        await verifyAdmin(token);
        loadFaqs(token);
    } catch (error) {
        alert(error.message);
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }

    // --- DARK MODE TOGGLE ---
    const body = document.body;
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Apply theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    // --- TAB SWITCHING ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;

            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- SEARCH FAQ ---
    searchFaqInput.addEventListener('input', () => {
        const searchTerm = normalizeText(searchFaqInput.value);
        const filteredFaqs = allFaqs.filter(faq => 
            normalizeText(faq.question).includes(searchTerm)
        );
        renderFaqs(filteredFaqs);
    });
});

// --- Normalize Text ---
function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- Verificar admin ---
async function verifyAdmin(token) {
    const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Sesión inválida o no autorizada.');

    const user = await response.json();
    if (user.role !== 'admin') throw new Error('Acceso denegado. Se requiere rol de administrador.');

    return user;
}

// --- Cargar FAQs ---
async function loadFaqs(token) {
    const response = await fetch('/api/faqs', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    allFaqs = await response.json();
    renderFaqs(allFaqs);
}

// --- Render FAQs ---
function renderFaqs(faqs) {
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

// --- CRUD de FAQs ---
faqListBody.addEventListener('click', async (event) => {
    const target = event.target;
    const row = target.closest('tr');
    if (!row) return;

    const token = localStorage.getItem('authToken');

    if (target.classList.contains('delete-icon')) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta FAQ?')) return;
        await fetch(`/api/faqs/${row.dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadFaqs(token);
    }

    if (target.classList.contains('edit-icon')) {
        openEditModal(row.dataset.id, row.dataset.question, row.dataset.answer);
    }
});

createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const question = event.target.question.value.trim();
    const answer = event.target.answer.value.trim();

    if (!question || !answer) return alert("Todos los campos son obligatorios");

    await fetch('/api/faqs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question, answer })
    });

    createForm.reset();
    loadFaqs(token);

    // ✅ Feedback para Cypress
    let successMsg = document.getElementById('success-message');
    if (!successMsg) {
        successMsg = document.createElement('p');
        successMsg.id = "success-message";
        successMsg.style.color = "green";
        createForm.insertAdjacentElement('afterend', successMsg);
    }
    successMsg.textContent = "FAQ creada exitosamente";

    setTimeout(() => successMsg.remove(), 3000);
});

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const id = event.target['edit-faq-id'].value;
    const question = event.target['edit-question'].value.trim();
    const answer = event.target['edit-answer'].value.trim();

    if (!question || !answer) return alert("Todos los campos son obligatorios");

    await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question, answer })
    });

    closeEditModal();
    loadFaqs(token);
});

// --- Modal ---
function openEditModal(id, question, answer) {
    editForm.elements['edit-faq-id'].value = id;
    editForm.elements['edit-question'].value = question;
    editForm.elements['edit-answer'].value = answer;
    editModal.classList.add('visible');
}

function closeEditModal() {
    editModal.classList.remove('visible');
}

// --- Logout ---
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
});
