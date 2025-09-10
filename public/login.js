const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const googleSignInBtn = document.getElementById('google-signin-btn');
const auth = firebase.auth();

// --- LÓGICA PARA INICIO DE SESIÓN CON GOOGLE ---
googleSignInBtn.addEventListener('click', () => {
    errorMessage.textContent = '';
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(async (result) => {
            const token = await result.user.getIdToken();
            localStorage.setItem('authToken', token);

            // Informar a nuestro backend sobre el inicio de sesión para que verifique o cree el registro
            const response = await fetch('/api/auth/google-signin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                let msg = 'Error al iniciar sesión con Google.';
                try {
                    const data = await response.json();
                    msg = data.message || msg;
                } catch {}
                errorMessage.textContent = msg;
                return;
            }

            // Redirigir al panel correspondiente
            await redirectToPanel(token);
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage.textContent = 'El inicio de sesión fue cancelado.';
            } else {
                errorMessage.textContent = error.message || 'Error al iniciar sesión con Google.';
            }
        });
});

// --- LÓGICA PARA INICIO DE SESIÓN CON CORREO Y CONTRASEÑA ---
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
        // Verificar el perfil antes de redirigir
        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            let msg = 'Error al verificar el perfil.';
            try {
                const data = await response.json();
                msg = data.message || msg;
            } catch {}
            errorMessage.textContent = msg;
            return;
        }
        await redirectToPanel(token);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage.textContent = 'Correo o contraseña incorrectos.';
        } else {
            errorMessage.textContent = error.message;
        }
    }
});

// --- LÓGICA PARA MOSTRAR/OCULTAR CONTRASEÑA ---
togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
});

// --- FUNCIÓN AUXILIAR PARA REDIRECCIÓN INTELIGENTE ---
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