// Como el router de incidencias tiene mucha lógica, vamos a separar la lógica de las rutas
// 1. Importar
const pool = require('../bd/bd');

// 2. Funciones

// getIncidencias: función para obtener las incidencias --> todos los usuarios
const getIncidencias = async (req, res) => {
    try {
        // Lo mejor es construir la query final a trozos, para que sea más fácil montarla dependiendo de los parámetros que recibamos
        //let query = 'SELECT incidencia.* FROM incidencia';
        // Como la intención es mostrar el número de votos que tiene cada incidencia, vamos a dividir query en select y from
        let select = ['incidencia.*', 'COUNT(voto.id_voto) AS num_votos']; // De esta manera, si se selecciona el filtro de votos, podemos añadir el COUNT(voto.id_voto) AS num_votos al select para mostrarlo
        let from = ['incidencia'];
        let where = ['incidencia.esta_eliminada = false'];
        let values = [];
        let order = [];
        let join = ['LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia'];
        let groupBy = ['incidencia.id_incidencia'];

        // Un get normal y sencillo sería así:
        /*const result = await pool.query('SELECT * FROM incidencia WHERE esta_eliminada = false');
        res.json(result.rows);
        */
        // PEro nosotros buscamos hacer una query "dinámica" dependiendo de los parámetros que recibamos
        // Los parámetros son los filtros, que vendrán dados en req.query
        const {votos, historicas, fecha, proximidad, estado, lat, lon, propias} = req.query;

        // Si recibimos el parámetro historicas = true, monstramos las históricas, sino, solo las "activas"
        if (historicas === 'true') {
            where.push('incidencia.fecha_archivado IS NOT NULL');
        } else {
            where.push('incidencia.fecha_archivado IS NULL');
        }

        // Si recibimos estado, filtramos por estado
        // Los valores serán: 1 = nueva, 2 = validada, 3 = en proceso, 4 = resuelta (igual que en la BD para facilidad)
        // Si se selecciona más de un estado en el filtro, recibiremos un array de strings
        // Por ejemplo: ?estado=1&estado=2
        if (estado) {
            const estadosArray = Array.isArray(estado) ? estado : [estado];
            // Para evitar problemas con los índices, utilizamos el número de parámetros que ya tenemos en values 
            // para asignar el número correcto al parámetro de la query
            where.push(`incidencia.estado_id = ANY($${values.length + 1})`);
            values.push(estadosArray);
        }

        // Si recibimos fecha, ordenamos por fecha de creación,
        // de manera ascendente o descendente dependiendo del valor de fecha
        if (fecha) {
            const ordenFecha = fecha === 'reciente' ? 'incidencia.fecha_creacion DESC' : 'incidencia.fecha_creacion ASC';
            order.push(ordenFecha);
        }

        // Si recibimos votos = true, ordenamos de manera descendente por numero de votos
        // Aquí tenemos que empezar con JOIN en la query, ya que necesitamos acceder a la tabla votos
        // select.push('COUNT(voto.id_voto) AS num_votos');
        // join.push('LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia');
        // groupBy.push('incidencia.id_incidencia');
        // Vamos a dejarlos mejor ya dentro de la query al principio, de esta manera siempre aparecerá el número de votos de cada incidencia
        // Solo añadimos el orden cuando se selecciona el filtro de votos.
        if (votos === 'true') {
            order.push('num_votos DESC');
        }

        // Si recibimos proximidad, recibiremos algo estilo ?long=-3.58573&lat=40.73593&proximidad=500
        if (proximidad && lat && lon) {
            // Primero obtenemos los índices de latitud, longitud y proximidad para la query, 
            // ya que no sabemos lo que puede haber en la query y romper la lógica si los ponemos a mano como $1 $2
            const lonIndice = values.length + 1;
            const latIndice = lonIndice + 1;
            const proximidadIndice = latIndice + 1;
            // Ahora los añadimos en values en el mismo orden que los índices
            values.push(long, lat, proximidad);
            // Ahora añadimos la parte de la query (WHERE) que calcula los puntos que se encuentran dentro del rango de proximidad
            // Para ello vamos a usar ST_DWithin y ST_MakePoint de PostGIS
            // ST_DWithin(incidencia.ubicacion, ST_MakePoint(longitud, latitud)::geography, proximidad) -> utilizamos ::geography para convertir el punto a geografía y poder usar metros en proximidad
            // ST_MakePoint lo que hace es crear un punto a partir de la longitud y latitud que le pasamos
            // ST_DWithin lo que hace es comprobar si la ubicación de la incidencia está dentro del rango de proximidad que le pasamos, y devuelve true o false
            where.push(`ST_DWithin(incidencia.ubicacion, 
                ST_MakePoint($${lonIndice}, $${latIndice})::geography, $${proximidadIndice})`);
        }

        // Si recibimos el parametro propias = true, filtramos para mostrar solo las incidencias creadas por el usuario que hace la petición
        if (propias === 'true') {
            // Para eso, necesitamos saber primero el id_usuario de quien está haciendo la petición, que obtenemos de req.usuario.id_usuario
            const idUsuario = req.usuario.id_usuario;
            const propiasIndice = values.length + 1;
            where.push(`incidencia.usuario_id = $${propiasIndice}`);
            values.push(idUsuario);
        }

        // Construimos la query final
        // Primero select y from
        let query = 'SELECT ' + select.join(', ') + ' FROM ' + from.join(' ');
        // Luego los JOIN
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
        } else {
            query += ' ORDER BY incidencia.fecha_creacion DESC';
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

// getIncidenciasUsuario: función para obtener las incidencias de un usuario --> solo gestores
const getIncidenciasUsuario = async (req, res) => {
    try {
        // Primero necesitamos leer el id del usuario del que queremos obtener las incidencias
        const id = req.params.id;
        // Hacemos la query
        const result = await pool.query(`SELECT incidencia.*, COUNT (voto.id_voto) FROM incidencia 
            LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia 
            WHERE incidencia.usuario_id = $1 AND incidencia.esta_eliminada = false
            GROUP BY incidencia.id_incidencia
            ORDER BY incidencia.fecha_creacion DESC`, [id]);
        // Comprobamos que nos ha devuelto algo
        if (result.rows.length === 0) {
            return res.status(404).send('No se encontraron incidencias para este usuario');
        }
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Error al obtener las incidencias del usuario:', error);
        res.status(500).send('Error al obtener las incidencias del usuario');
    }
};

// getIncidenciasId: función para obtener la información de una incidencia --> todos los usuarios
const getIncidenciaId = async (req, res) => {
    try {
        // Leemos el id de la incidencia sobre la que queremos obtener la información
        const id = req.params.id;
        // Hacemos las querys
        // Primero la de la propia incidencia con el número de votos, el estado y la categoría
        // Como cada incidencia tiene 1 estado y 1 catgeoría, podemos juntarlo en la misma query
        const infoIncidencia = await pool.query(`SELECT incidencia.titulo, incidencia.descripcion, incidencia.fecha_creacion,
            incidencia.fecha_actualizacion, incidencia.fecha_resolucion, incidencia.ubicacion, incidencia.direccion_texto,
            incidencia.descripcion_resolucion, incidencia.fecha_validacion, incidencia.validada, categoria.nombre AS categoria,
            estado_incidencia.nombre AS estado,
            COUNT (voto.id_voto)::int AS num_votos
            FROM incidencia
            LEFT JOIN categoria ON categoria.id_categoria = incidencia.categoria_id
            LEFT JOIN estado_incidencia ON estado_incidencia.id_estado = incidencia.estado_id
            LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia
            WHERE incidencia.id_incidencia = $1 AND incidencia.esta_eliminada = false
            GROUP BY incidencia.id_incidencia, categoria.id_categoria, estado_incidencia.id_estado`, [id]);
        if (infoIncidencia.rows.length === 0) {
            return res.status(404).send('Incidencia no encontrada');
        }
        // La de comentarios
        const comentarios = await pool.query(`SELECT comentario.texto, comentario.fecha_creacion, comentario.es_anonimo, 
            CASE WHEN comentario.es_anonimo = true THEN usuario.alias ELSE usuario.nombre END AS autor
            FROM comentario
            LEFT JOIN usuario ON usuario.id_usuario = comentario.usuario_id
            WHERE incidencia_id = $1 AND esta_eliminado = false
            ORDER BY comentario.fecha_creacion DESC`, [id]);

        // La de imagenes
        const imagenes = await pool.query(`SELECT * FROM imagen WHERE incidencia_id = $1 AND esta_eliminada = false`, [id]);

        // Unimos las 3 partes
        const incidenciaCompleta = {...infoIncidencia.rows[0], comentarios: comentarios.rows, imagenes: imagenes.rows};

        res.status(200).json(incidenciaCompleta);
        
    } catch (error) {
        console.error('Error al obtener la información de la incidencia:', error);
        res.status(500).send('Error al obtener la información de la incidencia');
        
    }
};

// postNuevaIncidencia: función para crear una nueva incidencia
const postNuevaIncidencia = async (req, res) => {
    try {
        // Primero leemos de body todos los campos para crear una nueva incidencia
        // Comprobamos que no falta ninguno
        // Comprobamos longitud de texto, que la categoría existe, etc.
        // Definimos los valores iniciales que no vienen dados por el usuario como estado, prioridad, etc.
        // Como usamos PostGIS y en la bd tenemos la ubicación como geography(POINT, 4326), 
        // debemos crear el punto con ST_MakePoint(long, lat)::geography
        // Realizamos la query de la incidencia
        // Comprobamos si hay imágenes (req.files), y si las hay las añadimos
        // Devolvemos la petición HTTP con la incidncia guardada
        
    } catch (error) {
        console.error('Error al crear nueva incidencia:', error);
        res.status(500).send('Error al crear nueva incidencia');
        
    }
};

// 3. Exportar
module.exports = {
    // Funciones a exportar
    getIncidencias,
    getIncidenciasUsuario,
    getIncidenciaId,
    postNuevaIncidencia
};