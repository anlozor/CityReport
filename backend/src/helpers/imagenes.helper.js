// Archivo para poder reutilizar la lógica de subida de imágenes
// 1. Pool
const pool = require('../bd/bd');

// 2. Función para guardar imagenes
// Recibirá imágenes a guardar, usuario_id e incidencia_id
// Actualización: como también se permiten imagenes en comentarios y solicitudes de gestor, pasamos a definir los dos parámetros extras junto con incidencia_id a null
// De esta manera, si alguo de ellos viene de la llamada con "8" por ejemplo, los otros dos serán null.
// Así podemos asociar tranquilamente las imágenes a la tabla corresponidente
const guardarImagenes = async (cliente, imagenes, usuario_id, incidencia_id = null, comentario_id = null, solicitud_id = null) => {
    // Array donde vamos a guardar las imágenes subidas
    const imagenesSubidas = [];
    // Insertamos las imágenes en la base de datos
    for (const imagen of imagenes) {
        const imagenSubida = await cliente.query(`INSERT INTO imagen (ruta, fecha_subida, usuario_id, incidencia_id, comentario_id, solicitud_id, esta_eliminada)
            VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6) RETURNING *`, 
            [imagen.filename, usuario_id, incidencia_id, comentario_id, solicitud_id, false]);
        // Comprobamos que se ha insertado correctamente
        if (imagenSubida.rows.length === 0) {
            throw new Error('Error al subir la imagen');
        }
        imagenesSubidas.push(imagenSubida.rows[0]);
    }

    return imagenesSubidas;
};

// 3. Exportar
module.exports = {
    guardarImagenes
};