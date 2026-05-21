// Como el router de incidencias tiene mucha lógica, vamos a separar la lógica de las rutas
// 1. Importar
const pool = require('../bd/bd');

// 2. Funciones
// Lo mejor es construir la query final a trozos, para que sea más fácil montarla dependiendo de los parámetros que recibamos
let query = 'SELECT * FROM incidencia WHERE esta_eliminada = false';
let where = [];
let values = [];
let order = '';

// getIncidencias: función para obtener las incidencias
const getIncidencias = async (req, res) => {
    try {
        // Un get normal y sencillo sería así:
        /*const result = await pool.query('SELECT * FROM incidencia WHERE esta_eliminada = false');
        res.json(result.rows);
        */
        // PEro nosotros buscamos hacer una query "dinámica" dependiendo de los parámetros que recibamos
        // Los parámetros son los filtros, que vendrán dados en req.query
        const {votos, historicas, fecha, proximidad, estado} = req.query;
        // Si recibimos el parámetro historicas
        if (historicas === 'true') {
            where.push("fecha_archivado IS NOT NULL");
        }

    } catch (error) {
        console.error('Error al obtener las incidencias:', error);
        res.status(500).send('Error al obtener las incidencias');
    }
};

// 3. Exportar
module.exports = {
    // Funciones a exportar
    getIncidencias
};