const pool = require('../bd/bd');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {fileTypeFromBuffer} = require('file-type');
const sharp = require('sharp');

// Helper para obtener toda la información de todas las incidencias seleccioandas desde el frontend para geenrar el documento
const getIncidenciasConIdsDocs = async (ids) => {
    if (!ids || ids.length === 0){
        return [];
    }

    // Incidencias y votos
    const incidenciasResult = await pool.query(`SELECT incidencia.*,
        COUNT(voto.id_voto)::int AS num_votos
        FROM incidencia
        LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia
        WHERE incidencia.id_incidencia = ANY($1) AND incidencia.esta_eliminada = false
        GROUP BY incidencia.id_incidencia`, [ids]);

    const incidencias = incidenciasResult.rows;

    // Comentarios las incidencias
    const comentariosResult = await pool.query(`SELECT comentario.id_comentario, comentario.texto, comentario.fecha_creacion, comentario.es_anonimo,
        comentario.incidencia_id, usuario.rol_id,
            CASE 
                WHEN usuario.identificador_gestor IS NOT NULL THEN usuario.identificador_gestor
                WHEN comentario.es_anonimo = true THEN usuario.alias
                ELSE usuario.nombre
            END AS autor
        FROM comentario
        LEFT JOIN usuario ON usuario.id_usuario = comentario.usuario_id
        WHERE comentario.incidencia_id = ANY($1) AND comentario.esta_eliminado = false
        ORDER BY comentario.fecha_creacion DESC`, [ids]);

    const comentarios = comentariosResult.rows;

    // Imágenes de los comentarios
    const imagenesComentariosResult = await pool.query(`SELECT imagen.* FROM imagen
        INNER JOIN comentario ON comentario.id_comentario = imagen.comentario_id
        WHERE comentario.incidencia_id = ANY($1) AND imagen.esta_eliminada = false`, [ids]);

    const imagenesComentarios = imagenesComentariosResult.rows;

    // Imágenes de las incidencias
    const imagenesIncidenciasResult = await pool.query(`SELECT * FROM imagen WHERE incidencia_id = ANY($1) AND comentario_id IS NULL
        AND esta_eliminada = false`, [ids]);

    const imagenesIncidencias = imagenesIncidenciasResult.rows;

    // Unimos las partes
    const resultadoFinal = incidencias.map(inc => {
        const comentariosInc = comentarios.filter(c => c.incidencia_id === inc.id_incidencia).map(c => ({
            ...c,
            imagenesComentarios: imagenesComentarios.filter(
                img => img.comentario_id === c.id_comentario
            ),
            es_gestor: c.rol_id === 1 || c.rol_id === 2
        }));

        return {
            ...inc,
            comentarios: comentariosInc,
            imagenes: imagenesIncidencias.filter(
                img => img.incidencia_id === inc.id_incidencia
            )
        };
    });

    return resultadoFinal;
};

// Helper para cargar las imagenes en un buffer antes de ponerlas en un pdf
const cargarImagenBuffer = async (ruta) => {
    const filePath = path.join(__dirname, "..", "..", "uploads", ruta);
    const buffer = await fs.promises.readFile(filePath);
    const type = await fileTypeFromBuffer(buffer);

    // Si es WebP, lo convertimos a PNG para que PDFKit lo soporte
    if (type?.mime === 'image/webp') {
        const convertido = await sharp(buffer).png().toBuffer();
        return { buffer: convertido, type: 'image/png' };
    }

    return { buffer, type: type?.mime };
};

module.exports = {
    getIncidenciasConIdsDocs,
    cargarImagenBuffer
};