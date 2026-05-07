// 1. Express, pool y middleware
const express = require('express');
const pool = require('../bd/bd');
const autorizarRol = require('../middlewares/roles.middleware');
const usuarioNoBloqueado = require('../middlewares/usuarios.middleware');
const upload = require('../middlewares/upload.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// POST -> subir imágenes de una incidencia --> cualquier usuario
router.post('/', usuarioNoBloqueado, upload.array('imagenes', 2), async (req, res) => {
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
        for (const imagen in imagenes) {
            const imagenSubida = await pool.query(`INSERT INTO imagen (ruta, fecha_subida, usuario_id, incidencia_id, esta_eliminada)
                VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING *`, 
                [imagenes[imagen].path, req.usuario.id_usuario, id_incidencia, false]);
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
router.delete('/:id', async (req, res) => {
try {
    
} catch (error) {
    
}
});

// 4. Exportar
module.exports = router;