// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todas las categorías de las incidencias --> cualquier usuario para crear una incidencia o gestores para cambiarla
router.get('/', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos las categorías
        const result = await pool.query(`SELECT * FROM categoria  WHERE esta_eliminada = false ORDER BY nombre ASC`);
        // Luego enviamos la petición HTTP con el resultado
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({
            mensaje: 'Error al obtener las categorías'});
        
    }
});

// POST -> añadir una nueva categoría --> solo gestores
router.post('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero obtenemos del body la nueva categoría
        const {nombre} = req.body;
        // Comprobamos que no está vacío
        if (!nombre) {
            return res.status(400).json({
                mensaje: 'El nombre de la categoría es obligatorio'});
        }
        // Comprobamos que no existe ya en la BD con normalización
        // Primero quitamos espacios al principio y al final para comprobar que el nombre no son solo espacios
        const nombrePulido = nombre.trim();
        if (nombrePulido.length === 0) {
            return res.status(400).json({
                mensaje: 'El nombre de la categoría es obligatorio'});
        }
        // Luego comprobamos que no hay símbolos de puntuación como corchetes, paréntesis, comas, puntos, etc.
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]@+<>|]/;
        if (regex.test(nombrePulido)) {
            return res.status(400).json({
                mensaje: 'El nombre de la categoría no puede contener símbolos de puntuación'});
        }
        // Ahora normalizamos y comprobamos si existe
        const nombreNormalizado = nombrePulido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const categoriaExiste = await pool.query(`SELECT * FROM categoria WHERE unaccent(lower(trim(nombre))) = $1`, [nombreNormalizado]);
        if (categoriaExiste.rows.length > 0) {
            return res.status(400).json({
                mensaje: 'La categoría ya existe'});
        }
        // Añadimos la nueva categoría
        const result = await pool.query(`INSERT INTO categoria (nombre, esta_eliminada) VALUES ($1, false) RETURNING *`, [nombrePulido]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al añadir la categoría:', error);
        res.status(500).json({
            mensaje: 'Error al añadir la categoría'});
    }
});

// DELETE -> eliminar una categoría --> solo gestores
router.delete('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Obtenemos el id de la categoría a eliminar y el id del gestor que la elimina
        const idCategoria = req.params.id;
        const idGestor = req.usuario.id_usuario;
        // Comprobamos que existe la categoría
        const categoriaExiste = await pool.query(`SELECT * FROM categoria WHERE id_categoria = $1 AND esta_eliminada = false`, [idCategoria]);
        if (categoriaExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'La categoría no existe'});
        }
        // Comporbamos que no hay ninguna incidencia asociada a la categoría
        const incidenciasAsociadas = await pool.query(`SELECT * FROM incidencia WHERE categoria_id = $1 AND esta_eliminada = false`, [idCategoria]);
        if (incidenciasAsociadas.rows.length > 0) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar la categoría porque tiene incidencias asociadas'});
        }
        // Eliminamos la categoría (esta_eliminada = true, fecha_eliminacion, eliminado_por)
        const result = await pool.query(`UPDATE categoria SET esta_eliminada = true, fecha_eliminacion = CURRENT_DATE, eliminado_por = $1 
            WHERE id_categoria = $2 RETURNING *`, [idGestor, idCategoria]);
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar la categoría'});
    }
});

// 4. Exportar router
module.exports = router;