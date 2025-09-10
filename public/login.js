const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const googleSignInBtn = document.getElementById('google-signin-btn');
const auth = firebase.auth();

// --- LOGIN CON GOOGLE (MÉTODO POPUP) ---
googleSignInBtn.addEventListener('click', async () => {
    errorMessage.textContent = '';
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        // Abrimos el popup de Google
        const result = await auth.signInWithPopup(provider);

        // Obtenemos el token de Firebase
        const token = await result.user.getIdToken();
        localStorage.setItem('authToken', token);

        // Informamos a nuestro backend (creación o validación de usuario)
        await fetch('/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Redirigimos según rol
        await redirectToPanel(token);

    } catch (error) {
        console.error(error);
        errorMessage.textContent = 'Error al iniciar sesión con Google.';
    }
});

// --- LOGIN CON CORREO Y CONTRASEÑA ---
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

// --- MOSTRAR/OCULTAR CONTRASEÑA ---
togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
});

// --- FUNCIÓN DE REDIRECCIÓN SEGÚN ROL ---
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
