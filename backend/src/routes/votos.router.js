// Estructura del router:
// 1. Importar Express
// 2. Crear router
// Añadir middlewares si fueran necesarios
// 3. Definir rutas:
//      GET /votos
//      POST /votos
// 4. Exportar router

// 1. Express
const express = require('express');

// 2. Router
const router = express.Router();

// Middleware
//router.use((req, res, next) => {
//    next(); // La siguiente función a usar
//});

// 3. Rutas
// Obtener los votos
router.get('/', (req, res) => {
    return res.send('Listado de votos');
});

// Crear voto
//router.post();

// 4. Exportar
module.exports = router;