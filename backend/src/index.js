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
require('dotenv').config(); // Para poder cargar las variables del archivo .env
const express = require('express'); // Para crear el servidor backend
const cors = require('cors'); // Para poder comunicar el frontend con el backend
const pool = require('./bd/bd'); // Para poder conectar con la base de datos
const auth = require('./middlewares/auth.middleware'); // Para usar el middleware de autenticación
const rol = require('./middlewares/roles.middleware'); // Para usar el middleware de roles
require('./cron/archivarCron'); // Para usar el cron de archivado de incidencias
const path = require("path"); // Para guardar bien la ruta de las imágenes

// Cargamos routers
const votosRouter = require("./routes/votos.router");
const usuariosRouter = require("./routes/usuarios.router");
const rolesRouter = require("./routes/roles.router");
const imagenesRouter = require("./routes/imagenes.router");
const estadosRouter = require("./routes/estados.router");
const comentariosRouter = require("./routes/comentarios.router");
const categoriasRouter = require("./routes/categorias.router");
const cambiosEstadosRouter = require("./routes/cambiosestados.router");
const incidenciasRouter = require("./routes/incidencias.router");
const solicitudesGestorRouter = require("./routes/solicitudesgestor.router");

// 2. Servidor
const app = express();

// 3. Middlewares
app.use(express.json()); // Permitimos recibir datos en formato JSON
app.use(cors()); // Permitimos hacer peticiones desde el frontend
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // Guardamos las imágenes como http://localhost... para poder acceder a ellas en frontend

app.use('/votos', votosRouter);
app.use('/usuarios',usuariosRouter);
app.use('/roles', rolesRouter);
app.use('/imagenes', imagenesRouter);
app.use('/estados', estadosRouter);
app.use('/comentarios', comentariosRouter);
app.use('/categorias', categoriasRouter);
app.use('/cambiosestados', cambiosEstadosRouter);
app.use('/incidencias', incidenciasRouter);
app.use('/solicitudes-gestor', solicitudesGestorRouter);

// 4. Conexión a BBDD

// 5. Rutas
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// 6. Definimos el puerto
const PORT = process.env.PORT || 3000; // Por si falla .env

// PRUEBA DE CONEXIÓN CON BD
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Error conectando a la BD', err);
    } else {
        console.log('BD conectada:', result.rows);
    }
});

// 7. Arrancar el servidor
// Arrancamos el servidor y mandamos un mensaje a la terminal para comprobar que funciona
app.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`);
});

// Para poder capturar mensajes de error como los del multer que van por cb, y los mandamos al frontend como json
app.use((err, req, res, next) => {
    res.status(400).json({
        mensaje: err.message
    });
});