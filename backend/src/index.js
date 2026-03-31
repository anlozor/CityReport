// Núcleo del backend
// Estructura:
// 1. Librerías importadas
// 2. Servidor
// 3. Middlewares
// 4. Rutas
// 5. Puerto
// 6. Conexión BBDD
// 7. Arrancar servidor

// 1. Librerías
const express = require('express'); // Para crear el servidor backend
const cors = require('cors'); // Para poder comunicar el frontend con el backend
require('dotenv').config(); // Para poder cargar las variables del archivo .env

// 2. Servidor
const servidor = express();

// 3. Middlewares
servidor.use(express.json()); // Permitimos recibir datos en formato JSON
servidor.use(cors()); // Permitimos hacer peticiones desde el frontend

// 4. Rutas
// Ruta de prueba
servidor.get('/', (req, res) => {
    res.send('API funcionando');
});

// 5. Definimos el puerto
const PORT = 3000;

// 6. Conexión a BBDD

// 7. Arrancar el servidor
// Arrancamos el servidor y mandamos un mensaje a la terminal para comprobar que funciona
servidor.listen(PORT, () => {
    console.log('Servidor funcionando en puerto ${PORT}');
});
