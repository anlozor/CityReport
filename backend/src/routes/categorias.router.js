// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todas las categorías de las incidencias --> cualquier usuario para crear una incidencia
router.get('/', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos las categorías
        const result = await pool.query(`SELECT * FROM categoria  WHERE esta_eliminada = false ORDER BY nombre ASC`);
        // Luego enviamos la petición HTTP con el resultado
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).send('Error al obtener las categorías');
        
    }
});

// POST -> añadir una nueva categoría --> solo gestores
router.post('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero obtenemos del body la nueva categoría
        const {nombre} = req.body;
        // Comprobamos que no está vacío
        if (!nombre) {
            return res.status(400).send('El nombre de la categoría es obligatorio');
        }
        // Comprobamos que no existe ya en la BD con normalización
        // Primero quitamos espacios al principio y al final para comprobar que el nombre no son solo espacios
        const nombrePulido = nombre.trim();
        if (nombrePulido.length === 0) {
            return res.status(400).send('El nombre de la categoría es obligatorio');
        }
        // Luego comprobamos que no hay símbolos de puntuación como corchetes, paréntesis, comas, puntos, etc.
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]@+<>|]/;
        if (regex.test(nombrePulido)) {
            return res.status(400).send('El nombre de la categoría no puede contener símbolos de puntuación');
        }
        // Ahora normalizamos y comprobamos si existe
        const nombreNormalizado = nombrePulido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const categoriaExiste = await pool.query(`SELECT * FROM categoria WHERE unaccent(lower(trim(nombre))) = $1`, [nombreNormalizado]);
        if (categoriaExiste.rows.length > 0) {
            return res.status(400).send('La categoría ya existe');
        }
        // Añadimos la nueva categoría
        const result = await pool.query(`INSERT INTO categoria (nombre, esta_eliminada) VALUES ($1, false) RETURNING *`, [nombrePulido]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al añadir la categoría:', error);
        res.status(500).send('Error al añadir la categoría');
    }
});

// DELETE -> eliminar una categoría --> solo gestores
router.delete('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // HAY QUE COMPROBAR QUE NO HAY NINGUNA INCIDENCIA ASOCIADA A LA CATEGORÍA ANTES DE ELIMINARLA
    } catch (error) {
        
    }
});

// 4. Exportar router
module.exports = router;