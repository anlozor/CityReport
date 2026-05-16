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

// POST -> añadir un nuevo comentario a una incidencia --> cualquier usuario puede añadir un comentario a una incidencia
router.post('/', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos del body los datos del nuevo comentario
        const { texto, incidencia_id, es_anonimo} = req.body;
        // Comprobamos que ninguno esté vacío
        if (!texto || !incidencia_id ||es_anonimo === undefined) {
            return res.status(400).send('Faltan datos obligatorios');
        }

        // Pulimos texto para evitar espacios en blanco al principio y al final y para evitar que el texto esté compuesto solo por espacios en blanco
        const textoPulido = texto.trim();
        // Comprobamos que el texto no está vacío después de pulirlo
        if (textoPulido.length === 0) {
            return res.status(400).send('El texto del comentario no puede estar vacío');
        }
        // Comprobamos que no se pasa de la longitud máxima de 250 caracteres
        if (textoPulido.length > 250) {
            return res.status(400).send('El texto del comentario no puede tener más de 250 caracteres');
        }
        // Comprobamos que el texto no contiene palabras ofensivas
        const palabrasOfensivas = ['idiota', 'tonto', 'estupido', 'imbecil', 'gilipollas', 'pendejo', 'cabron', 'puta', 'maricon', 'zorra'];
        const textoNormalizado = textoPulido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, '');
        for (const palabra of textoNormalizado.split(' ')) {
            if (palabrasOfensivas.includes(palabra)) {
                return res.status(400).send('El texto del comentario contiene palabras ofensivas');
            }
        }

        // Obtenemos también el usuario_id del token
        const usuario_id = req.usuario.id_usuario;
        
        // Comprobamos que la incidencia existe
        const incidencia = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [incidencia_id]);
        if (incidencia.rows.length === 0) {
            return res.status(404).send('La incidencia no existe');
        }

        // Añadimos el nuevo comentario en la BD
        const result = await pool.query(`INSERT INTO comentario (texto, fecha_creacion, usuario_id, incidencia_id, es_anonimo, esta_eliminado)
        VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, false) RETURNING *`, [textoPulido, usuario_id, incidencia_id, es_anonimo]);
        
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error al añadir el comentario:', error);
        res.status(500).send('Error al añadir el comentario');
    }
});

// DELETE -> eliminar un comentario (ocultarlo) --> tanto gestores como el autor del comentario
router.delete('/:id', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos el comentario a eliminar
        const id = req.params.id;
        // Comprobamos que el comentario existe y no está eliminado ya
        const comentarioExiste = await pool.query(`SELECT * FROM comentario WHERE id_comentario = $1`, [id]);
        if (comentarioExiste.rows.length === 0) {
            return res.status(404).send('El comentario no existe');
        }
        if (comentarioExiste.rows[0].esta_eliminado) {
            return res.status(400).send('El comentario ya está eliminado');
        }

        // Comprobamos si el usuario es el autor del comentario o un gestor, sino no puede eliminar el comentario
        const esAutor = Number(comentarioExiste.rows[0].usuario_id) === Number(req.usuario.id_usuario);
        const esGestor = Number(req.usuario.rol_id) === 1 || Number(req.usuario.rol_id) === 2;
        if (!esAutor && !esGestor) {
            return res.status(403).send('No tienes permiso para eliminar este comentario');
        }

        // Ocultamos el comentario en la bd con esta_eliminado = true y rellenamos fecha_eliminacion y eliminado_por
        const comentarioEliminado = await pool.query(`UPDATE comentario SET esta_eliminado = true, eliminado_por = $1, fecha_eliminacion = CURRENT_DATE 
            WHERE id_comentario = $2 RETURNING *`, [req.usuario.id_usuario, id]);
        // Comprobamos que se ha actualizado correctamente
        if (comentarioEliminado.rows.length === 0) {
            return res.status(500).send('Error al eliminar el comentario');
        }
        res.status(200).json(comentarioEliminado.rows[0]);
    } catch (error) {
        console.error('Error al eliminar el comentario:', error);
        res.status(500).send('Error al eliminar el comentario');
    }
});

// PATCH -> editar un comentario --> autor de su propio comentario
router.patch('/:id', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        // Primero obtenemos el comentario a editar
        const id = req.params.id;
        // Luego comprobamos que el comentario existe y no está eliminado ya
        const comentarioExiste = await pool.query(`SELECT * FROM comentario WHERE id_comentario = $1`, [id]);
        if (comentarioExiste.rows.length === 0) {
            return res.status(404).send('El comentario no existe');
        }
        if (comentarioExiste.rows[0].esta_eliminado) {
            return res.status(400).send('El comentario está eliminado y no se puede editar');
        }
        // Comprobamos que el usuario es el autor del comentario, sino no puede editar el comentario
        const esAutor = Number(comentarioExiste.rows[0].usuario_id) === Number(req.usuario.id_usuario);
        if (!esAutor) {
            return res.status(403).send('No tienes permiso para editar este comentario');
        }

        // Comprobamos que el comentario no lleva más de 15 minutos creado, sino no se puede editar
        const fechaActual = new Date();
        const fechaCreacion = new Date(comentarioExiste.rows[0].fecha_creacion);
        const limiteTiempo = 15 * 60 * 1000; // 15 minutos en milisegundos
        const diferenciaTiempo = fechaActual - fechaCreacion;
        if (diferenciaTiempo > limiteTiempo) {
            return res.status(400).send('Hace más de 15 minutos que se creó el comentario y no se puede editar');
        }

        // Obtenemos del body el nuevo texto del comentario y comprobamos que no está vacío, que no se pasa de la longitud máxima de 250 caracteres y que no contiene palabras ofensivas
        const {texto} = req.body;
        if (!texto) {
            return res.status(400).send('Falta el texto del comentario');
        }
        const textoPulido = texto.trim();
        if (textoPulido.length === 0) {
            return res.status(400).send('El texto del comentario no puede estar vacío');
        }
        if (textoPulido.length > 250) {
            return res.status(400).send('El texto del comentario no puede tener más de 250 caracteres');
        }
        const palabrasOfensivas = ['idiota', 'tonto', 'estupido', 'imbecil', 'gilipollas', 'pendejo', 'cabron', 'puta', 'maricon', 'zorra'];
        const textoNormalizado = textoPulido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, '');
        for (const palabra of textoNormalizado.split(' ')) {
            if (palabrasOfensivas.includes(palabra)) {
                return res.status(400).send('El texto del comentario contiene palabras ofensivas');
            }
        }
        // Actualizamos el texto del comentario en la BD y rellenamos fecha_edicion y editado_por
        const comentarioEditado = await pool.query(`UPDATE comentario SET texto = $1 WHERE id_comentario = $2 RETURNING *`, [textoPulido, id]);
        res.status(200).json(comentarioEditado.rows[0]);
        
    } catch (error) {
        console.error('Error al editar el comentario:', error);
        res.status(500).send('Error al editar el comentario');
    }
});

// 4. Exportar router
module.exports = router;