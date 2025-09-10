// src/public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (errorMessage) errorMessage.textContent = '';

            const email = event.target.email.value;
            const password = event.target.password.value;

            try {
                // 1️⃣ Enviar login al backend
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    if (errorMessage) errorMessage.textContent = data.message;
                    return;
                }

                console.log('Login exitoso:', data);

                // 2️⃣ Guardar JWT y userId en localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', data.userId);

                // 3️⃣ Verificar token y obtener datos del usuario
                const profileResponse = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                        'X-User-Id': data.userId
                    }
                });

                if (!profileResponse.ok) {
                    throw new Error('No se pudo verificar el perfil del usuario.');
                }

                const profileData = await profileResponse.json();
                console.log('Perfil del usuario:', profileData);

                // 4️⃣ Redirección según rol
                if (profileData.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/chat.html';
                }

            } catch (error) {
                console.error('Error en la solicitud:', error);
                if (errorMessage) errorMessage.textContent = 'Error de conexión o token inválido.';
            }
        });
    }

    // Lógica para mostrar/ocultar contraseña
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }
});
