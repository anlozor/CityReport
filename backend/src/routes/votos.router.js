// Estructura del router:
// 1. Importar Express y conexión con PostgreSQL
// 2. Crear router
// Añadir middlewares si fueran necesarios
// 3. Definir rutas:
//      GET /votos
//      POST /votos
// 4. Exportar router

// 1. Express y PostgreSQL
const express = require('express');
const pool = require('../bd/bd');

// 2. Router
const router = express.Router();

// Middleware
//router.use((req, res, next) => {
//    next(); // La siguiente función a usar
//});

// 3. Rutas
// Obtener los votos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM voto');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error obteniendo votos:', error);
        res.status(500).send('Error al obtener votos');
    }
});

// Crear voto
router.post('/', async (req, res) => {
    try {
        const {usuario_id, incidencia_id} = req.body;

        // Control de error si alguna de las tres no está en el body
        if (!usuario_id || !incidencia_id) {
            return res.status(400).send('Faltan datos obligatorios');
        }

        const result = await pool.query(
            `INSERT INTO voto (usuario_id, incidencia_id, fecha_voto)
            VALUES ($1, $2, CURRENT_DATE)
            RETURNING *`, [usuario_id, incidencia_id]
        );
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creando voto:', error);
        //res.status(500).send('Error al crear voto');
        res.status(500).json({
            message: 'Error al crear voto',
            detail: error.message
        });
    }
});

// 4. Exportar
module.exports = router;