const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, // ojo: usa el mismo nombre que tienes en .env
  port: 4000, // TiDB suele usar 4000, revisa tu panel si es otro
  ssl: {
    rejectUnauthorized: false, // obliga a usar conexión segura
  },
});

connection.connect(error => {
  if (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    return;
  }
  console.log('✅ ¡Conexión exitosa a la base de datos MySQL!');
});

module.exports = connection;
