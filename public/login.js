const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const googleSignInBtn = document.getElementById('google-signin-btn');
const auth = firebase.auth();

// --- LOGIN CON GOOGLE (MÉTODO DE REDIRECCIÓN) ---
googleSignInBtn.addEventListener('click', () => {
    errorMessage.textContent = '';
    const provider = new firebase.auth.GoogleAuthProvider();
    // Usar popup en vez de redirección para evitar problemas de sesión
    auth.signInWithPopup(provider)
        .then(async (result) => {
            if (result.user) {
                errorMessage.textContent = 'Iniciando sesión...';
                const token = await result.user.getIdToken();
                localStorage.setItem('authToken', token);
                // Informar a nuestro backend sobre el inicio de sesión para que lo guarde en la BD si es nuevo
                const googleSignInResponse = await fetch('/api/auth/google-signin', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Respuesta de /api/auth/google-signin:', googleSignInResponse);
                await redirectToPanel(token);
            }
        })
        .catch((error) => {
            console.error('Error en login con Google:', error);
            errorMessage.textContent = error.message || 'Error al iniciar sesión con Google.';
        });
});

// --- MANEJO DEL RESULTADO DE LA REDIRECCIÓN ---
// Esta función se ejecuta automáticamente CADA VEZ que la página de login carga
(async function handleRedirectResult() {
    // Ya no es necesario manejar el resultado de la redirección
})();


// --- LOGIN CON CORREO Y CONTRASEÑA (sin cambios) ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';
    const email = event.target.email.value;
    const password = event.target.password.value;
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (!userCredential.user.emailVerified) {
            auth.signOut();
            throw new Error("Por favor, verifica tu correo electrónico para poder ingresar.");
        }
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('authToken', token);
        await redirectToPanel(token);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage.textContent = 'Correo o contraseña incorrectos.';
        } else {
            errorMessage.textContent = error.message;
        }
    }
});

// --- MOSTRAR/OCULTAR CONTRASEÑA (sin cambios) ---
togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
});

// --- FUNCIÓN DE REDIRECCIÓN INTELIGENTE (sin cambios) ---
async function redirectToPanel(token) {
    let attempts = 0;
    let lastError = null;
    while (attempts < 3) {
        try {
            const profileResponse = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!profileResponse.ok) {
                const profileError = await profileResponse.json();
                lastError = profileError.message;
                // Si el usuario no existe, espera y reintenta
                if (profileError.message === 'Usuario no encontrado.') {
                    await new Promise(res => setTimeout(res, 1000));
                    attempts++;
                    continue;
                }
                throw new Error(profileError.message);
            }
            const profileData = await profileResponse.json();
            console.log('Respuesta de /api/auth/me:', profileData);
            if (profileData.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/chat.html';
            }
            return;
        } catch (error) {
            lastError = error.message;
            await new Promise(res => setTimeout(res, 1000));
            attempts++;
        }
    }
    errorMessage.textContent = lastError || 'No se pudo verificar el perfil del usuario.';
}