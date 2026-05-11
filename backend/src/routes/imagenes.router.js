// 1. Express, pool y middleware
const express = require('express');
const pool = require('../bd/bd');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/uploads.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// POST -> subir imágenes de una incidencia --> cualquier usuario
router.post('/', auth,usuarioNoBloqueado, upload.array('imagenes', 2), async (req, res) => {
    try {
        // Obtenemos las imágenes
        const imagenes = req.files;
        // Comprobamos que no está vacío
        if (imagenes.length === 0) {
            return res.status(400).send('No se han subido imágenes');
        }
        // Obtenemos el id de la incidencia a la que están asociadas las imágenes
        const id_incidencia = req.body.id_incidencia;
        // Comprobamos que está el id de la incidencia
        if (!id_incidencia) {
            return res. status(400).send('Falta el id de la incidencia');
        }
        // Array donde vamos a guardar las imágenes subidas
        const imagenesSubidas = [];
        // Insertamos las imágenes en la base de datos
        for (const imagen of imagenes) {
            const imagenSubida = await pool.query(`INSERT INTO imagen (ruta, fecha_subida, usuario_id, incidencia_id, esta_eliminada)
                VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING *`, 
                [imagen.path, req.usuario.id_usuario, id_incidencia, false]);
            // Comprobamos que se ha insertado correctamente
            if (imagenSubida.rows.length === 0) {
                return res.status(500).send('Error al subir la imagen');
            }
            imagenesSubidas.push(imagenSubida.rows[0]);
        }
        // Devolvemos las imágenes subidas
        res.status(201).json({
            mensaje: 'Imágenes subidas correctamente',
            imagenes: imagenesSubidas
        });
    } catch (error) {
        console.error('Error al subir las imágenes:', error);
        res.status(500).send('Error al subir las imágenes');
    }
});

// DELETE -> eliminar imágenes de una incidencia --> solo gestores
router.delete('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
try {
    // Obtenemos la imagen a eliminar
    const id_imagen = req.params.id;
    // Comprobamos que la imagen existe
    const imagen = await pool.query(`SELECT * FROM imagen WHERE id_imagen = $1`, [id_imagen]);
    if (imagen.rows.length === 0) {
        return res.status(404).send('Imagen no encontrada');
    }
    // Comprobamos que la imagen no está eliminada ya
    if (imagen.rows[0].esta_eliminada) {
        return res.status(400).send('La imagen ya está eliminada');
    }
    // Marcamos la imagen como eliminada (esta_eliminada, eliminado_por, fecha_eliminacion)
    const imagenEliminada = await pool.query(`UPDATE imagen 
        SET esta_eliminada = true, eliminado_por = $2, fecha_eliminacion = CURRENT_DATE 
        WHERE id_imagen = $1 RETURNING *`, 
        [id_imagen, req.usuario.id_usuario]);
    // No vamos a eliminar la imagen del disco ya que un gestor avanzado al revisarlo puede decidir mantenerla,
    // o bien el gestor que la eliminó puede haberse equivocado y así el gestor avanzado puede recuperarla
    
    // Comprobamos que se ha actualizado correctamente
    if (imagenEliminada.rows.length === 0) {
        return res.status(500).send('Error al eliminar la imagen');
    }
    res.status(200).json({
        mensaje: 'Imagen eliminada correctamente',
        imagen: imagenEliminada.rows[0]
    });
    
} catch (error) {
    console.error('Error al eliminar la imagen:', error);
    res.status(500).send('Error al eliminar la imagen');
}
});

// PATCH -> recuperar imágenes eliminadas de una incidencia --> solo gestores avanzados
router.patch('/:id/recuperar', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        // Obtenemos la imagen a recuperar
        const id_imagen = req.params.id;
        // Comprobamos que la imagen existe
        const imagen = await pool.query(`SELECT * FROM imagen WHERE id_imagen = $1`, [id_imagen]);
        if (imagen.rows.length === 0) {
            return res.status(404).send('Imagen no encontrada');
        }
        // Comprobamos que la imagen está eliminada
        if (!imagen.rows[0].esta_eliminada) {
            return res.status(400).send('La imagen no está eliminada');
        }
        // Marcamos la imagen como no eliminada (esta_eliminada, eliminado_por, fecha_eliminacion) --> RECUPERAMOS la imagen
        const imagenRecuperada = await pool.query(`UPDATE imagen 
            SET esta_eliminada = false, eliminado_por = NULL, fecha_eliminacion = NULL 
            WHERE id_imagen = $1 RETURNING *`, [id_imagen]);
        // Comprobamos que se ha actualizado correctamente
        if (imagenRecuperada.rows.length === 0) {
            return res.status(500).send('Error al recuperar la imagen');
        }

        res.status(200).json({
            mensaje: 'Imagen recuperada correctamente',
            imagen: imagenRecuperada.rows[0]
        });

    } catch (error) {
        console.error('Error al recuperar la imagen:', error);
        res.status(500).send('Error al recuperar la imagen');
    }
});

// 4. Exportar
module.exports = router;