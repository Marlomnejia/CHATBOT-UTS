// --- ELEMENTOS DEL DOM ---
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const googleSignInBtn = document.getElementById('google-signin-btn');
const auth = firebase.auth();

// --- VALIDACIÓN BÁSICA DE CORREO ---
function isValidEmail(email) {
    // Regex simple para validar formato de correo
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- LOGIN CON GOOGLE ---
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
        errorMessage.textContent = '';
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            const token = await result.user.getIdToken();
            localStorage.setItem('authToken', token);

            // Notificar a backend
            await fetch('/api/auth/google-signin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await redirectToPanel(token);

        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage.textContent = 'El inicio de sesión fue cancelado.';
            } else {
                errorMessage.textContent = 'Error al iniciar sesión con Google.';
                console.error(error);
            }
        }
    });
}

// --- LOGIN CON CORREO Y CONTRASEÑA ---
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();

        // Validaciones
        if (!email || !password) {
            errorMessage.textContent = 'Por favor completa todos los campos.';
            return;
        }
        if (!isValidEmail(email)) {
            errorMessage.textContent = 'El correo ingresado no es válido.';
            return;
        }

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            if (!userCredential.user.emailVerified) {
                await auth.signOut();
                throw new Error('Por favor, verifica tu correo electrónico para poder ingresar.');
            }

            const token = await userCredential.user.getIdToken();
            localStorage.setItem('authToken', token);

            await redirectToPanel(token);

        } catch (error) {
            console.error(error);
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage.textContent = 'Correo o contraseña incorrectos.';
                    break;
                case 'auth/invalid-email':
                    errorMessage.textContent = 'El correo ingresado no es válido.';
                    break;
                default:
                    errorMessage.textContent = error.message || 'Error al iniciar sesión.';
            }
        }
    });
}

// --- TOGGLE DE CONTRASEÑA ---
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
    });
}

// --- REDIRECCIÓN SEGÚN ROL ---
async function redirectToPanel(token) {
    try {
        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo verificar el perfil.');
        }

        const profile = await response.json();

        if (profile.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/chat.html';
        }

    } catch (error) {
        console.error(error);
        errorMessage.textContent = error.message || 'No se pudo redirigir al panel.';
    }
}
