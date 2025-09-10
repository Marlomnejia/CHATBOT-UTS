const admin = require('firebase-admin');

// Asegurarse de que la variable de entorno exista antes de usarla
if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error('La variable de entorno FIREBASE_CREDENTIALS no está definida.');
}

// Parsea las credenciales desde la variable de entorno
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Inicializa la aplicación de administrador de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exporta la instancia inicializada para que otros archivos puedan usarla
module.exports = admin;