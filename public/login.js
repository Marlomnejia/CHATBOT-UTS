// src/public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // Obteniendo elementos del DOM
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Maneja el login con email y contraseña
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Limpia mensajes de error anteriores
            if (errorMessage) {
                errorMessage.textContent = '';
            }

            const email = event.target.email.value;
            const password = event.target.password.value;

            try {
                // Envía la solicitud de login a tu backend
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Login exitoso:', data);
                    // Guarda el token y el userId en el almacenamiento local
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userId', data.userId);

                    // Redirección inteligente basada en el rol
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
                    if (profileData.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/chat.html';
                    }

                } else {
                    // Muestra el mensaje de error del backend
                    if (errorMessage) {
                        errorMessage.textContent = data.message;
                    } else {
                        console.error('Error de login:', data.message);
                    }
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'Error de conexión. Inténtalo de nuevo.';
                }
            }
        });
    }

    // Lógica para mostrar/ocultar la contraseña
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
        });
    }
});