// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const {pulirYNormalizarTexto, contienePalabrasOfensivas} = require('../helpers/texto.helper');
const upload = require('../middlewares/uploads.middleware');
const {guardarImagenes} = require('../helpers/imagenes.helper');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener todos los comentarios de una incidencia --> cualquier usuario para ver los comentarios de una incidencia
router.get('/incidencia/:id', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos el id de la incidencia
        const id = req.params.id;
        // Comprobamos que la incidencia existe
        const incidencia = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [id]);
            if (incidencia.rows.length === 0) {
                return res.status(404).json({
                    mensaje: 'La incidencia no existe'});
            }
        // Luego obtenemos los comentarios de la incidencia que no estén eliminados ordenados por fecha de creación de más reciente a más antiguo
        const result = await pool.query(`SELECT comentario.id_comentario, comentario.texto, comentario.fecha_creacion, comentario.es_anonimo, 
            usuario.nombre, usuario.alias, usuario.identificador_gestor,
            imagen.id_imagen, imagen.ruta
            FROM comentario JOIN usuario ON comentario.usuario_id = usuario.id_usuario
            LEFT JOIN imagen ON imagen.comentario_id = comentario.id_comentario AND imagen.esta_eliminada = false
            WHERE comentario.incidencia_id = $1 AND comentario.esta_eliminado = false
            ORDER BY comentario.fecha_creacion DESC`, [id]);
        // Además, utilizamos un join para obtener el nombre del usuario que ha hecho el comentario y su alias por si ha marcado el comentario como anónimo
        // Y otro join para poder obtener las imagenes relacionadas a cada comentario
        console.log("RESULTADO:", result.rows);
        // Comprobamos que hay comentarios y sino devolvemos un mensaje indicando que no hay comentarios
        if (result.rows.length === 0) {
            return res.status(200).json({
                mensaje: 'No hay comentarios en esta incidencia'});
        }
        
        // Comprobamos si el usuario ha marcado como anónimo el comentario y si es así mostramos su alias en vez de su nombre
        const comentariosArreglados = [];
        for (const comentario of result.rows) { // Recorremos el array de comentarios
            let autor;
            if (comentario.identificador_gestor) { // Si es gestor, siempre guardamos el identificador de gestor
                autor = comentario.identificador_gestor;
            } else if (comentario.es_anonimo) { // si es anonimo, guardamos el alias
                autor = comentario.alias;
            } else { // si no es anonimo, guardamos el nombre
                autor = comentario.nombre;
            }

            const comentarioActual = {
                id_comentario: comentario.id_comentario,
                texto: comentario.texto,
                fecha_creacion: comentario.fecha_creacion,
                autor: autor,
                imagenes: []
            };

            comentariosArreglados.push(comentarioActual);

            // Si el comentario tiene una imagen, lo añadimos
            if (comentario.id_imagen) {
                comentarioActual.imagenes.push({
                    id_imagen: comentario.id_imagen,
                    ruta: comentario.ruta
                });
            }
        }
        // Luego enviamos la petición HTTP con el resultado si todo ha ido bien
        res.status(200).json(comentariosArreglados);
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los comentarios'});
    }
});

// POST -> añadir un nuevo comentario a una incidencia --> cualquier usuario puede añadir un comentario a una incidencia
router.post('/', auth, usuarioNoBloqueado, upload.array('imagen', 1), async (req, res) => {
    try {
        // Primero obtenemos del body los datos del nuevo comentario
        const { texto, incidencia_id, es_anonimo} = req.body;
        // Comprobamos que ninguno esté vacío
        if (!texto || !incidencia_id || es_anonimo === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'});
        }

        // Pulimos texto para evitar espacios en blanco al principio y al final y para evitar que el texto esté compuesto solo por espacios en blanco
        // Comprobamos que el texto no está vacío después de pulirlo
        if (texto.trim().length === 0) {
            return res.status(400).json({
                mensaje: 'El texto del comentario no puede estar vacío'});
        }
        // Comprobamos que no se pasa de la longitud máxima de 250 caracteres
        if (texto.trim().length > 250) {
            return res.status(400).json({
                mensaje: 'El texto del comentario no puede tener más de 250 caracteres'});
        }
        // Comprobamos que el texto no contiene palabras ofensivas
        const textoNormalizado = pulirYNormalizarTexto(texto);
        if (contienePalabrasOfensivas(textoNormalizado)) {
            return res.status(400).json({
                mensaje: 'El texto contiene palabras ofensivas'});
        }

        // Obtenemos también el usuario_id del token
        const usuario_id = req.usuario.id_usuario;
        
        // Comprobamos que la incidencia existe
        const incidencia = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [incidencia_id]);
        if (incidencia.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'La incidencia no existe'});
        }

        // Añadimos el nuevo comentario en la BD
        const result = await pool.query(`INSERT INTO comentario (texto, fecha_creacion, usuario_id, incidencia_id, es_anonimo, esta_eliminado)
        VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, false) RETURNING *`, [texto.trim(), usuario_id, incidencia_id, es_anonimo]);

        // Una vez hemos guardado el comentario, miramos si hay imagenes, y si las hay, las guardamos ya sabiendo el id_comentario
        if (req.files && req.files.length > 0) {
            await guardarImagenes(req.files, usuario_id, null, result.rows[0].id_comentario);
        }
        
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error al añadir el comentario:', error);
        res.status(500).json({
            mensaje: 'Error al añadir el comentario'});
    }
});

// PATCH -> eliminar un comentario (ocultarlo) --> tanto gestores como el autor del comentario
router.patch('/:id/eliminar', auth, usuarioNoBloqueado, async (req, res) => {
    const cliente = await pool.connect();
    try {
        // Primero obtenemos el comentario a eliminar
        const id = req.params.id;

        await cliente.query('BEGIN');

        // Comprobamos que el comentario existe y no está eliminado ya
        const comentarioExiste = await cliente.query(`SELECT * FROM comentario WHERE id_comentario = $1`, [id]);
        if (comentarioExiste.rows.length === 0) {
            await cliente.query('ROLLBACK');
            return res.status(404).json({
                mensaje: 'El comentario no existe'});
        }
        if (comentarioExiste.rows[0].esta_eliminado) {
            await cliente.query('ROLLBACK');
            return res.status(400).json({
                mensaje: 'El comentario ya está eliminado'});
        }

        // Comprobamos si el usuario es el autor del comentario o un gestor, sino no puede eliminar el comentario
        const esAutor = Number(comentarioExiste.rows[0].usuario_id) === Number(req.usuario.id_usuario);
        const esGestor = Number(req.usuario.rol_id) === 1 || Number(req.usuario.rol_id) === 2;
        if (!esAutor && !esGestor) {
            await cliente.query('ROLLBACK');
            return res.status(403).json({
                mensaje: 'No tienes permiso para eliminar este comentario'});
        }

        // Ocultamos el comentario en la bd con esta_eliminado = true y rellenamos fecha_eliminacion y eliminado_por
        // Además de eliminar la imagen asociada si la tiene, por lo que debemos hacerlo con una transacción

        // Eliminamos el comentario
        await cliente.query(`UPDATE comentario SET esta_eliminado = true, eliminado_por = $1, fecha_eliminacion = CURRENT_DATE 
            WHERE id_comentario = $2 RETURNING *`, [req.usuario.idGestor, id]);

        // Eliminamos imagenes asociadas
        await cliente.query(`UPDATE imagen SET esta_eliminada = true, fecha_eliminacion = CURRENT_DATE, eliminado_por = $1 
            WHERE comentario_id = $2`, [req.usuario.idGestor, id]);
            
        await cliente.query('COMMIT');
        res.status(200).json({
            mensaje: 'Comentario eliminado correctamente'});
            
    } catch (error) {
        await cliente.query('ROLLBACK');

        console.error('Error al eliminar comentario:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar comentario'});
            
    } finally {
        cliente.release();

    }
    
});

// PATCH -> editar un comentario --> autor de su propio comentario
router.patch('/:id/editar', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos el comentario a editar
        const id = req.params.id;
        // Luego comprobamos que el comentario existe y no está eliminado ya
        const comentarioExiste = await pool.query(`SELECT * FROM comentario WHERE id_comentario = $1`, [id]);
        if (comentarioExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'El comentario no existe'});
        }
        if (comentarioExiste.rows[0].esta_eliminado) {
            return res.status(400).json({
                mensaje: 'El comentario está eliminado y no se puede editar'});
        }
        // Comprobamos que el usuario es el autor del comentario, sino no puede editar el comentario
        const esAutor = Number(comentarioExiste.rows[0].usuario_id) === Number(req.usuario.id_usuario);
        if (!esAutor) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para editar este comentario'});
        }

        // Comprobamos que el comentario no lleva más de 15 minutos creado, sino no se puede editar
        const fechaActual = new Date();
        const fechaCreacion = new Date(comentarioExiste.rows[0].fecha_creacion);
        const limiteTiempo = 15 * 60 * 1000; // 15 minutos en milisegundos
        const diferenciaTiempo = fechaActual - fechaCreacion;
        if (diferenciaTiempo > limiteTiempo) {
            return res.status(400).json({
                mensaje: 'Hace más de 15 minutos que se creó el comentario y no se puede editar'});
        }

        // Obtenemos del body el nuevo texto del comentario y comprobamos que no está vacío, que no se pasa de la longitud máxima de 250 caracteres y que no contiene palabras ofensivas
        const {texto} = req.body;
        if (!texto) {
            return res.status(400).json({
                mensaje: 'Falta el texto del comentario'});
        }
        if (texto.trim().length === 0) {
            return res.status(400).json({
                mensaje: 'El texto del comentario no puede estar vacío'});
        }
        if (texto.trim().length > 250) {
            return res.status(400).json({
                mensaje: 'El texto del comentario no puede tener más de 250 caracteres'});
        }
        const textoNormalizado = pulirYNormalizarTexto(texto);
        if (contienePalabrasOfensivas(textoNormalizado)) {
            return res.status(400).json({
                mensaje: 'El texto del comentario contiene palabras ofensivas'});
        }

        // Actualizamos el texto del comentario en la BD
        const comentarioEditado = await pool.query(`UPDATE comentario SET texto = $1 WHERE id_comentario = $2 RETURNING *`, [texto.trim(), id]);
        res.status(200).json(comentarioEditado.rows[0]);
        
    } catch (error) {
        console.error('Error al editar el comentario:', error);
        res.status(500).json({
            mensaje: 'Error al editar el comentario'});
    }
});

// 4. Exportar router
module.exports = router;