// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todos los cambios de estado de las incidencias --> solo gestores
router.get('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero obtenemos los cambios de estado
        const result = await pool.query(`SELECT cambio_estado.id_cambio_estado, cambio_estado.incidencia_id, 
            cambio_estado.fecha_cambio, estado_incidencia.nombre AS estado, usuario.nombre AS usuario
            FROM cambio_estado
            JOIN estado_incidencia ON cambio_estado.estado_id = estado_incidencia.id_estado
            JOIN usuario ON cambio_estado.usuario_id = usuario.id_usuario
            ORDER BY cambio_estado.fecha_cambio DESC`);
        // Luego enviamos la petición HTTP con el resultado
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Error al obtener los cambios de estado:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los cambios de estado'});
    }
});

// GET -> obtener todos los cambios de estado de una incidencia --> solo gestores y el usuario que creó la incidencia
router.get('/incidencia/:idIncidencia', auth, usuarioNoBloqueado, async (req, res) => {
    // Si es gestor, puede ver los cambios de estado
    // Si no es gestor, solo puede ver los cambios de estado de las incidencias que ha creado
    try {
        // Primero obtenemos el id del usuario y su rol
        const idUsuario = req.usuario.id_usuario;
        const rolUsuario = req.usuario.rol_id;
        // Luego obtenemos el id de la incidencia de los parámetros de la ruta
        const idIncidencia = req.params.idIncidencia;
        // Comprobamos que la incidencia existe
        const incidenciaExiste = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [idIncidencia]);
        if (incidenciaExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'La incidencia no existe'});
        }
        // Si el usuario no es gestor, comprobamos que es el creador de la incidencia
        const esGestor = Number(req.usuario.rol_id) === 1 || Number(req.usuario.rol_id) === 2;
        if (!esGestor && Number(incidenciaExiste.rows[0].usuario_id) !== Number(idUsuario)) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para ver los cambios de estado de esta incidencia'});
        }
        // Obtenemos los cambios de estado de la incidencia
        const result = await pool.query(`SELECT cambio_estado.id_cambio_estado, cambio_estado.incidencia_id, 
            cambio_estado.fecha_cambio, estado_incidencia.nombre AS estado, usuario.nombre AS usuario
            FROM cambio_estado
            JOIN estado_incidencia ON cambio_estado.estado_id = estado_incidencia.id_estado
            JOIN usuario ON cambio_estado.usuario_id = usuario.id_usuario
            WHERE cambio_estado.incidencia_id = $1
            ORDER BY cambio_estado.fecha_cambio DESC`, [idIncidencia]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los cambios de estado de la incidencia:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los cambios de estado de la incidencia'});
    }
});

// 4. Exportar router
module.exports = router;