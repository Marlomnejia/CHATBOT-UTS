// Seleccionar elementos del DOM
const registerForm = document.getElementById('register-form');
const messageElement = document.getElementById('message');
const auth = firebase.auth(); // Obtenemos la instancia de autenticación de Firebase

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

        // 4. Informar a nuestro backend sobre el nuevo usuario para guardarlo en MySQL
        const response = await fetch('/api/auth/create-user-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, name: name, email: email })
        });

        if (!response.ok) {
            // Si falla el guardado en nuestro backend, es un problema serio
            throw new Error('No se pudo guardar el registro del usuario en el servidor.');
        }

        messageElement.textContent = "¡Registro exitoso! Por favor, revisa tu bandeja de entrada para verificar tu correo.";
        messageElement.classList.add('success');
        
        // Redirigir al login después de unos segundos
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);

    } catch (error) {
        // Manejar errores comunes de Firebase y de nuestro backend
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