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

// 3. Rutas
//  GET -> Obtener los votos
router.get('/', async (req, res) => {
    try {
        // Primero lanzamos la query y esperamos a que nos responda con await
        const result = await pool.query('SELECT * FROM voto');
        // Enviamos estado de petición HTTP y resultado
        res.status(200).json(result.rows);
    } catch (error) {
        // Emitimos error
        console.error('Error obteniendo votos:', error);
        // Enviamos estado de error de petición HTTP junto con mensaje
        res.status(500).send('Error al obtener votos');
    }
});

// POST -> Crear voto y actualizar prioridad de incidencia
router.post('/', async (req, res) => {
    try {
        const {usuario_id, incidencia_id} = req.body;

        // Control de error si alguna de las tres no está en el body
        if (!usuario_id || !incidencia_id) {
            return res.status(400).send('Faltan datos obligatorios');
        }
        // Comprobamos también aquí además de en la bd si el usuario ya ha hecho un voto en la incidencia
        const existe = await pool.query(`SELECT 1 FROM voto WHERE usuario_id = $1 AND incidencia_id = $2`,
            [usuario_id, incidencia_id]);
        if (existe.rows.length > 0) {
            return res.status(409).send('El usuario ya ha votado esta incidencia');
        }

        const result = await pool.query(
            `INSERT INTO voto (usuario_id, incidencia_id, fecha_voto)
            VALUES ($1, $2, CURRENT_DATE)
            RETURNING *`, [usuario_id, incidencia_id]
        );

        // Ahora recalculamos los votos de la incidencia tras el nuevo voto
        const numVotosResult = await pool.query(`SELECT COUNT(*) FROM voto WHERE incidencia_id = $1`, [incidencia_id]);
        const numVotos = Number(numVotosResult.rows[0].count); // Columna count convertida de string a número
        // Calculamos la prioridad
        // 0-9 = baja (1), 10-19 = media (2), +20 = alta (3)
        let prioridad;
        switch (true) {
            case numVotos <= 9:
                prioridad = 1;
                break;
            
            case numVotos <= 19:
                prioridad = 2;
                break;
        
            default:
                prioridad = 3;
                break;
        }
        // Actualizamos incidencia.prioridad
        const prioridadActualizada = await pool.query(`UPDATE incidencia SET prioridad = $1 WHERE id_incidencia = $2`, [prioridad, incidencia_id]);

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