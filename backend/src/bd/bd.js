// Archivo para la conexión entre backend y base de datos
const {Pool} = require('pg'); // Importamos la librería pg (PostgreSQL)
//require('dotenv').config(); // Cargamos las variables de entorno

// Creamos un pool de conexiones
const pool = new Pool({
    user: process.env.BD_USER,
    host: process.env.BD_HOST,
    database: process.env.BD_NAME,
    password: process.env.BD_PASSWORD,
    port: process.env.BD_PORT
});

module.exports = pool; // Exportamos el pool de conexiones