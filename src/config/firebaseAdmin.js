const admin = require('firebase-admin');

// Carga las credenciales que descargaste
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;