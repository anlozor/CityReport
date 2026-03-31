// Importamos las librerías
const express = require('express'); // Para crear el servidor backend
const cors = require('cors'); // Para poder comunicar el frontend con el backend

const servidor = express();

servidor.use(express.json()); // Permitimos recibir datos en formato JSON
servidor.use(cors()); // Permitimos hacer peticiones desde el frontend

// Ruta de prueba
servidor.get('/', (req, res) => {res.send('API funcionando');});

// Definimos el puerto
const PORT = 3000;

// Arrancamos el servidor y mandamos un mensaje a la terminal para comprobar que funciona
servidor.listen(PORT, () => {console.log('Servidor funcionando en puerto ${PORT}');});
