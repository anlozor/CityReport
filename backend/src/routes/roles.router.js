// 1. Express y pool
const express = require('express');
const pool = require('../bd/bd');

// 2. Router
const router = express.Router();

// 3. Rutas
// Ya que la app está pensada para tener unos roles específicos, no es necesario implementar la ruta para el POST
// GET -> Listado de roles
router.get('/', async (req, res) => {
    try {
        // Primero la query
        const result = await pool.query(`SELECT * FROM rol`);
        // Estado de la petición HTTP y resultado
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el listado de roles'});
    }
});

// GET -> Rol específico
router.get('/:id', async (req, res) => {
    try {
        // Leemos el id
        const id = req.params.id;
        // Hacemos la query
        const result = await pool.query(`SELECT * FROM rol WHERE id_rol = $1`, [id]);
        // Comprobamos que nos ha devuelto algo
        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Rol no encontrado'});
        }
        // En caso contrario devolvemos el resultado encontrado
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el rol:', error);
        res.status(500).json({
            mensaje: 'Error al buscar el rol'});
    }
});

// 4. Exportar
module.exports = router;