// Seleccionar elementos del DOM
const registerForm = document.getElementById('register-form');
const messageElement = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageElement.textContent = '';
    messageElement.className = '';

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        // Enviar los datos de registro a tu backend
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = data.message;
            messageElement.classList.add('success');
            
            // Redirigir al login después de unos segundos
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        } else {
            messageElement.textContent = data.message || 'Hubo un error al registrar la cuenta.';
            messageElement.classList.add('error');
        }

    } catch (error) {
        messageElement.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo.';
        messageElement.classList.add('error');
    }
});