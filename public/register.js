const registerForm = document.getElementById('register-form');
const messageElement = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    messageElement.textContent = '';
    messageElement.className = '';

    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    if (!name || !email || !password) {
        messageElement.textContent = "Todos los campos son obligatorios.";
        messageElement.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error en el registro");

        messageElement.textContent = "✅ ¡Registro exitoso! Serás redirigido para iniciar sesión.";
        messageElement.classList.add('success');

        // 🔑 Señal clara para Cypress
        messageElement.id = "register-success";

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);

    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.classList.add('error');
        messageElement.id = "register-error"; // Para Cypress
    }
});
