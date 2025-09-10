const admin = require('firebase-admin');

// Carga las credenciales que descargaste desde la consola de Firebase
const serviceAccount = require('../../serviceAccountKey.json');

// Inicializa la aplicación de administrador de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exporta la instancia inicializada para que otros archivos puedan usarla
module.exports = admin;