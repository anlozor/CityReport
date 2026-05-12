// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todos los estados de las incidencias --> cualquier usuario para crear una incidencia
router.get('/', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos los estados
        const result = await pool.query(`SELECT * FROM estado_incidencia`);
        // Luego enviamos la petición HTTP con el resultado
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los estados:', error);
        res.status(500).json({ error: 'Error al obtener los estados' });
    }
});

// POST -> añadir un nuevo estado --> solo gestores
router.post('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero obtenemos del body el nuevo estado
        const {nombre} = req.body;
        // Comprobamos que el nombre no esté vacío
        if (!nombre) {
            return res.status(400).send('Falta el nombre del estado');
        }
        // Comprobamos que el estado no existe ya en la BD sin normalización
        //const estadoExiste = await pool.query(`SELECT * FROM estado_incidencia WHERE nombre = $1`, [nombre]);
        //if (estadoExiste.rows.length > 0) {
        //    return res.status(409).send('El estado ya existe');
        //}
        
        // Comprobamos que el estado no existe ya en la BD con normalización
        // Utilizamos normalize('NFD') para eliminar acentos y otros caracteres especiales
        // Replace para eliminar los caracteres diacríticos
        // Trim para eliminar espacios al principio y al final
        // Y toLowerCase para convertir todo a minúsculas
        const nombreNormalizado = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        const estadoExisteNormalizado = await pool.query(`SELECT * FROM estado_incidencia 
            WHERE unaccent(lower(trim(nombre))) = $1`, [nombreNormalizado]);
        if (estadoExisteNormalizado.rows.length > 0) {
            return res.status(409).send('El estado ya existe');
        }
        // Insertamos el nuevo estado en la base de datos con trim para eliminar espacios al principio y al final
        const result = await pool.query(`INSERT INTO estado_incidencia (nombre) VALUES ($1) returning *`, [nombre.trim()]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al añadir el estado:', error);
        res.status(500).json({ error: 'Error al añadir el estado' });
    }
});
// PATCH -> cambiar el estado de una incidencia --> solo gestores
router.patch('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        
    } catch (error) {
        
    }
});

// 4. Exportar router
module.exports = router;