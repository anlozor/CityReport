// Como el router de incidencias tiene mucha lógica, vamos a separar la lógica de las rutas
// 1. Importar
const pool = require('../bd/bd');

// 2. Funciones

// getIncidencias: función para obtener las incidencias
const getIncidencias = async (req, res) => {
    try {
        // Lo mejor es construir la query final a trozos, para que sea más fácil montarla dependiendo de los parámetros que recibamos
        let query = 'SELECT incidencia.* FROM incidencia';
        let where = ['esta_eliminada = false'];
        let values = [];
        let order = [];
        let join = [];
        let groupBy = [];

        // Un get normal y sencillo sería así:
        /*const result = await pool.query('SELECT * FROM incidencia WHERE esta_eliminada = false');
        res.json(result.rows);
        */
        // PEro nosotros buscamos hacer una query "dinámica" dependiendo de los parámetros que recibamos
        // Los parámetros son los filtros, que vendrán dados en req.query
        const {votos, historicas, fecha, proximidad, estado} = req.query;

        // Si recibimos el parámetro historicas = true, monstramos las históricas, sino, solo las "activas"
        if (historicas === 'true') {
            where.push('fecha_archivado IS NOT NULL');
        } else {
            where.push('fecha_archivado IS NULL');
        }

        // Si recibimos estado, filtramos por estado
        // Los valores serán: 1 = nueva, 2 = validada, 3 = en proceso, 4 = resuelta
        // Si se selecciona más de un estado en el filtro, recibiremos un array de strings
        // Por ejemplo: ?estado=nueva&estado=validada será estado = ['nueva', 'validada']
        if (estado) {
            const estadosArray = Array.isArray(estado) ? estado : [estado];
            // Para evitar problemas con los índices, utilizamos el número de parámetros que ya tenemos en values 
            // para asignar el número correcto al parámetro de la query
            where.push(`estado_id = ANY($${values.length + 1})`);
            values.push(estadosArray);
        }

        // Si recibimos fecha, ordenamos por fecha de creación,
        // de manera ascendente o descendente dependiendo del valor de fecha
        if (fecha) {
            const ordenFecha = fecha === 'reciente' ? 'fecha_creacion DESC' : 'fecha_creacion ASC';
            order.push(ordenFecha);
        }

        // Si recibimos votos = true, ordenamos de manera descendente por prioridad
        // Aquí tenemos que empezar con JOIN en la query, ya que necesitamos acceder a la tabla votos
        if (votos === 'true') {
            join.push('LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia');
            order.push('COUNT(voto.id_voto) DESC');
            groupBy.push('incidencia.id_incidencia');
        }

        // Construimos la query final
        // Primero los JOIN
        if (join.length > 0) {
            query += ' ' + join.join(' ');
        }
        // Luego los WHERE
        if (where.length > 0) {
            query += ' WHERE ' + where.join(' AND ');
        }
        // Luego los GROUP BY
        if (groupBy.length > 0) {
            query += ' GROUP BY ' + groupBy.join(', ');
        }
        // Luego los ORDER BY
        if (order.length > 0) {
            query += ' ORDER BY ' + order.join(', ');
        }

        // Hacemos la consulta dependiendo de si tenemos parámetros o no
        let result;
        if (values.length > 0) {
            result = await pool.query(query, values);
        } else {
            result = await pool.query(query);
        }
        // Enviamos la respuesta
        res.json(result.rows);

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