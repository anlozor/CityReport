// Archivo para poder reutilizar la lógica de subida de imágenes
// 1. Pool
const pool = require('../bd/bd');

// 2. Función para guardar imagenes
// Recibirá imágenes a guardar, usuario_id e incidencia_id
const guardarImagenes = async (imagenes, usuario_id, incidencia_id) => {
    // Array donde vamos a guardar las imágenes subidas
    const imagenesSubidas = [];
    // Insertamos las imágenes en la base de datos
    for (const imagen of imagenes) {
        const imagenSubida = await pool.query(`INSERT INTO imagen (ruta, fecha_subida, usuario_id, incidencia_id, esta_eliminada)
            VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING *`, 
            [imagen.path, usuario_id, incidencia_id, false]);
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