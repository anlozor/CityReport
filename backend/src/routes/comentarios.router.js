// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todos los comentarios de una incidencia --> cualquier usuario para ver los comentarios de una incidencia
router.get('/incidencia/:id', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos el id de la incidencia
        const id = req.params.id;
        // Comprobamos que la incidencia existe
        const incidencia = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia =$1`, [id]);
            if (incidencia.rows.length === 0) {
                return res.status(404).send('La incidencia no existe');
            }
        // Luego obtenemos los comentarios de la incidencia que no estén eliminados ordenados por fecha de creación de más reciente a más antiguo
        const result = await pool.query(`SELECT comentario.texto, comentario.fecha_creacion, comentario.es_anonimo, usuario.nombre, usuario.alias
            FROM comentario JOIN usuario ON comentario.usuario_id = usuario.id_usuario
            WHERE comentario.incidencia_id = $1 AND comentario.esta_eliminado = false
            ORDER BY comentario.fecha_creacion DESC`, [id]);
        // Además, utilizamos un join para obtener el nombre del usuario que ha hecho el comentario y su alias por si ha marcado el comentario como anónimo
        
        // Comprobamos que hay comentarios y sino devolvemos un mensaje indicando que no hay comentarios
        if (result.rows.length === 0) {
            return res.status(200).send('No hay comentarios en esta incidencia');
        }
        // Comprobamos si el usuario ha marcado como anónimo el comentario y si es así mostramos su alias en vez de su nombre
        const comentariosArreglados = [];
        for (const comentario of result.rows) { // Recorremos el array de comentarios
            if (comentario.es_anonimo) { // si es anonimo, guardamos el alias
                comentariosArreglados.push({
                    texto: comentario.texto,
                    fecha_creacion: comentario.fecha_creacion,
                    autor: comentario.alias
                });
            } else { // si no es anonimo, guardamos el nombre
                comentariosArreglados.push({
                    texto: comentario.texto,
                    fecha_creacion: comentario.fecha_creacion,
                    autor: comentario.nombre
                });
            }
        }
        // Luego enviamos la petición HTTP con el resultado si todo ha ido bien
        res.status(200).json(comentariosArreglados);
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
        res.status(500).send('Error al obtener los comentarios');
    }
});

// POST -> añadir un nuevo comentario a una incidencia --> cualquier usuario para añadir un comentario a una incidencia
router.post('/', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        
    } catch (error) {
        
    }
});

// DELETE -> eliminar un comentario --> solo gestores
router.delete('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        
    } catch (error) {
        
    }
});

// 4. Exportar router
module.exports = router;