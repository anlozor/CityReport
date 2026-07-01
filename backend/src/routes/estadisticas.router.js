const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

const router = express.Router();

// GET -> listado de incidencias creadas por semana, mes o año (query)
router.get('/incidencias-creadas', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        // Leemos el modo de buscar de la query (periodo)
        const {periodo} = req.query;

        // Vamos a comprobar, dependiendo de loq ue venga, cómo lo tengemos que agrupar
        let groupBy;
        if (periodo === 'semana') {
            groupBy = 'week';
        } else if (periodo === 'mes') {
            groupBy = 'month';
        } else {
            groupBy = 'year';
        }

        // Hacemos la query según haya llegado el query
        const result = await pool.query(`SELECT DATE_TRUNC($1, fecha_creacion) AS periodo, COUNT(*) AS total
            FROM incidencia GROUP BY periodo ORDER BY periodo`, [groupBy]);

        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error al obtener las incidencias creadas:", error);
        res.status(500).json({
            mensaje: "Error al obtener las incidencias creadas"
        });
        
    } 
});

// GET -> listado de incidencias por categoría, ordenadas por semana, mes o año (query)
router.get('/incidencias-categoria', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        // Leemos el modo de buscar de la query (periodo)
        const {periodo} = req.query;

        // Vamos a comprobar, dependiendo de loq ue venga, cómo lo tengemos que agrupar
        let interval;
        if (periodo === 'semana') {
            interval = '1 week';
        } else if (periodo === 'mes') {
            interval = '1 month';
        } else {
            interval = '1 year';
        }

        // Hacemos la consulta
        const result = await pool.query(`SELECT categoria.nombre, COUNT(*) AS total
            FROM incidencia
            JOIN categoria ON incidencia.categoria_nombre = categoria.nombre
            WHERE incidencia.fecha_creacion >= NOW() - INTERVAL '${interval}'
            GROUP BY categoria.nombre ORDER BY total DESC`);

        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error al obtener las incidencias por categoria:", error);
        res.status(500).json({
            mensaje: "Error al obtener las incidencias por categoria"
        });
    } 
});

// GET -> listado de comentarios eliminados con sus imagenes
router.get('/comentarios-eliminados', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        const result = await pool.query(`SELECT c.id_comentario, c.texto, c.fecha_eliminacion, u.identificador_gestor AS eliminado_por,
            i.id_incidencia, i.titulo, img.id_imagen, img.ruta
            FROM comentario c
            LEFT JOIN usuario u ON c.eliminado_por = u.id_usuario
            LEFT JOIN incidencia i ON c.incidencia_id = i.id_incidencia
            LEFT JOIN imagen img ON img.incidencia_id = i.id_incidencia AND img.esta_eliminada = false
            WHERE c.esta_eliminado = true
            ORDER BY c.fecha_eliminacion DESC`);
            return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error obteniendo los comentarios eliminados:", error);
        res.status(500).json({
            mensaje: "Error obteniendo los comentarios eliminados"
        });
    } 
});

// GET -> listado de imagenes de incidencias eliminadas
router.get('/imagenes-eliminadas', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        const result = await pool.query(`SELECT img.id_imagen, img.ruta, img.fecha_eliminacion, u.identificador_gestor,
            i.id_incidencia, i.titulo
            FROM imagen img
            LEFT JOIN usuario u ON img.eliminado_por = u.id_usuario
            LEFT JOIN incidencia i ON img.incidencia_id = i.id_incidencia
            WHERE img.esta_eliminada = true
            ORDER BY img.fecha_eliminacion DESC
        `);

        return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error obteniendo las imagenes eliminadas:", error);
        res.status(500).json({
            mensaje: "Error obteniendo las imagenes eliminadas"
        });
    }
});

// GET -> listado de usuarios bloqueados
router.get('/usuarios-bloqueados', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        const result = await pool.query(`SELECT u.id_usuario, u.nombre, u.email, u.motivo_bloqueo, u.fecha_bloqueo, g.identificador_gestor
            FROM usuario u
            LEFT JOIN usuario g ON u.bloqueado_por = g.id_usuario
            WHERE u.esta_bloqueado = true
            ORDER BY u.fecha_bloqueo DESC
        `);

        return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error("Error obteniendo los usuarios bloqueados:", error);
        res.status(500).json({
            mensaje: "Error obteniendo los usuarios bloqueados"
        });
    }
});

module.exports = router;