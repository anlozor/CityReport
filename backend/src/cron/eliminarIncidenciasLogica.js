// 1. Pool
const pool = require('../bd/bd');

// 2. Función para eliminar las incidencias que lleven eliminadas más de 30 días
const eliminarIncidencias = async () => {
    try {
        const result = await pool.query(`DELETE FROM incidencia WHERE esta_eliminada = true 
            AND fecha_eliminacion IS NOT NULL AND fecha_eliminacion <= CURRENT_DATE - interval '30 days'`);

        console.log(`Incidencias eliminadas: ${result.rowCount}`);
    } catch (error) {
        console.error('Error al eliminar incidencias definitivamente', error);
        
    }
};

// 3. Exportamos
module.exports = eliminarIncidencias;