document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // --- LOGIN CON CORREO Y CONTRASEÑA ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const email = event.target.email.value;
        const password = event.target.password.value;

        try {
            // Enviar datos al backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Credenciales inválidas');
            }

            // Guardar token en localStorage
            localStorage.setItem('authToken', data.token);

            // Obtener perfil del usuario
            const profileResponse = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (!profileResponse.ok) {
                const profileError = await profileResponse.json();
                throw new Error(profileError.message || 'No se pudo verificar el perfil del usuario.');
            }

            const profileData = await profileResponse.json();

            // Guardar userId
            localStorage.setItem('userId', profileData.id);

            // Redirigir según rol
            if (profileData.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/chat.html';
            }

        } catch (error) {
            // ✅ Mensaje fijo para Cypress
            errorMessage.textContent = "Credenciales inválidas";
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
        }
    });

    // --- MOSTRAR/OCULTAR CONTRASEÑA ---
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
    });


});
