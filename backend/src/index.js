// Núcleo del backend, aquí es donde se va a coordinary conectar todo
// Estructura:
// 1. Librerías importadas
// 2. Servidor
// 3. Middlewares
// 4. Conexión BBDD
// 5. Rutas
// 6. Puerto
// 7. Arrancar servidor

// 1. Librerías
const express = require('express'); // Para crear el servidor backend
const cors = require('cors'); // Para poder comunicar el frontend con el backend
require('dotenv').config(); // Para poder cargar las variables del archivo .env

// Cargamos 
const votosRuta = require("./rutas/votos.rutas");

// 2. Servidor
const app = express();

// 3. Middlewares
app.use(express.json()); // Permitimos recibir datos en formato JSON
app.use(cors()); // Permitimos hacer peticiones desde el frontend

app.use(votosRuta);

// 4. Conexión a BBDD

// 5. Rutas
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// 6. Definimos el puerto
const PORT = process.env.PORT || 3000; // Por si falla .env

// 7. Arrancar el servidor
// Arrancamos el servidor y mandamos un mensaje a la terminal para comprobar que funciona
app.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`);
});
