// --- ELEMENTOS DEL DOM ---
const faqListBody = document.getElementById('faq-list');
const createForm = document.getElementById('create-faq-form');
const logoutBtn = document.getElementById('logout-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-faq-form');

const token = localStorage.getItem('authToken');

// --- CÓDIGO DE INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
});

async function initializeAdminPanel() {
  if (!token) { window.location.href = '/login.html'; return; }
  try {
    const user = await verifyAdmin(token);
    if (user.role === 'admin') {
      loadFaqs();
    } else {
      alert('Acceso denegado.');
      window.location.href = '/chat.html';
    }
  } catch (error) {
    alert(error.message);
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
  }
}

async function verifyAdmin(token) {
  const response = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error('Sesión inválida.');
  return await response.json();
}

// --- LÓGICA CRUD ---
async function loadFaqs() {
  const response = await fetch('/api/faqs', { headers: { 'Authorization': `Bearer ${token}` } });
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
  const question = event.target.question.value;
  const answer = event.target.answer.value;
  await fetch('/api/faqs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ question, answer })
  });
  createForm.reset();
  document.querySelector('.create-faq-accordion').open = false;
  loadFaqs();
});

async function deleteFaq(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta FAQ?')) return;
  await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  loadFaqs();
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
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
    const id = editForm.elements['edit-faq-id'].value;
    const question = editForm.elements['edit-question'].value;
    const answer = editForm.elements['edit-answer'].value;
    await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, answer })
    });
    closeEditModal();
    loadFaqs();
});