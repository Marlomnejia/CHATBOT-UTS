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
    // 1. Redirige a la página de Google para iniciar sesión
    auth.signInWithRedirect(provider);
});

// --- MANEJO DEL RESULTADO DE LA REDIRECCIÓN ---
// Esta función se ejecuta automáticamente cuando la página de login carga
(async function handleRedirectResult() {
    try {
        const result = await auth.getRedirectResult();
        // Si 'result.user' existe, significa que el usuario acaba de volver de Google
        if (result.user) {
            const token = await result.user.getIdToken();
            localStorage.setItem('authToken', token);

            // Informar a nuestro backend sobre el inicio de sesión
            await fetch('/api/auth/google-signin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Redirigir al panel correspondiente
            await redirectToPanel(token);
        }
    } catch (error) {
        errorMessage.textContent = 'Error al procesar el inicio de sesión con Google.';
    }
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
    try {
        const profileResponse = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileResponse.ok) {
            const profileError = await profileResponse.json();
            throw new Error(profileError.message);
        }
        const profileData = await profileResponse.json();
        if (profileData.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/chat.html';
        }
    } catch (error) {
        errorMessage.textContent = error.message || 'No se pudo verificar el perfil del usuario.';
    }
}