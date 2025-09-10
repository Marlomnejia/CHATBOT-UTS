const registerForm = document.getElementById('register-form');
const messageElement = document.getElementById('message');
const auth = firebase.auth();

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageElement.textContent = '';
    messageElement.className = '';

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        // 1. Crear el usuario en Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Añadir el nombre al perfil del usuario en Firebase
        await user.updateProfile({
            displayName: name
        });
        
        // 3. Enviar el correo de verificación
        await user.sendEmailVerification();
        
        // 4. Obtener un token para autenticar la creación del registro en nuestra BD
        const token = await user.getIdToken();

        // 5. Informar a nuestro backend sobre el nuevo usuario de forma segura
        const response = await fetch('/api/auth/create-user-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo guardar el registro del usuario en el servidor.');
        }

        messageElement.textContent = "¡Registro exitoso! Por favor, revisa tu bandeja de entrada para verificar tu correo.";
        messageElement.classList.add('success');
        
        auth.signOut(); // Desloguear al usuario para que verifique su correo antes de entrar

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            messageElement.textContent = 'El correo electrónico ya está registrado.';
        } else if (error.code === 'auth/weak-password') {
            messageElement.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        } else {
            messageElement.textContent = error.message || 'Hubo un error al registrar la cuenta.';
        }
        messageElement.classList.add('error');
    }
});