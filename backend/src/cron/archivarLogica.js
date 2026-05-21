// 1. Tarea: archivar incidencias
// 2. Cada cuánto se ejecuta: cada día a las 00:00
// 3. Qué hace: UPDATE

// 1. Pool
const pool = require('../bd/bd');

// 2. Función para archivar incidencias
const archivarIncidencias = async () => {
    try {
        const result = await pool.query(`UPDATE incidencia SET fecha_archivado = CURRENT_DATE 
            WHERE esta_eliminada = false AND fecha_archivado IS NULL AND fecha_resolucion IS NOT NULL 
            AND fecha_resolucion <= CURRENT_DATE - interval '30 days'`);

        console.log(`Incidencias archivadas: ${result.rowCount}`);
    } catch (error) {
        console.error('Error al archivar incidencias:', error);
    }
};

// 3. Exportar función
module.exports = archivarIncidencias;