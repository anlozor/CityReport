// Como el router de incidencias tiene mucha lógica, vamos a separar la lógica de las rutas
// 1. Importar
const pool = require('../bd/bd');
const {guardarImagenes} = require('../helpers/imagenes.helper');
const {pulirYNormalizarTexto, contienePalabrasOfensivas} = require('../helpers/texto.helper');
const {esCambioEstadoValido, obtenerCamposCambioEstado} = require('../helpers/editarIncidencia.helper');

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
        // Los valores serán: nueva, validada, en proceso, resuelta (igual que en la BD para facilidad)
        // Si se selecciona más de un estado en el filtro, recibiremos un array de strings
        // Por ejemplo: ?estado=nueva&estado=validada
        if (estado) {
            const estadosArray = Array.isArray(estado) ? estado : [estado];
            // Para evitar problemas con los índices, utilizamos el número de parámetros que ya tenemos en values 
            // para asignar el número correcto al parámetro de la query
            where.push(`incidencia.estado_nombre = ANY($${values.length + 1})`);
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

        // Si recibimos proximidad, recibiremos algo estilo ?lon=-3.58573&lat=40.73593&proximidad=500
        if (proximidad && lat && lon) {
            // Primero obtenemos los índices de latitud, longitud y proximidad para la query, 
            // ya que no sabemos lo que puede haber en la query y romper la lógica si los ponemos a mano como $1 $2
            const lonIndice = values.length + 1;
            const latIndice = lonIndice + 1;
            const proximidadIndice = latIndice + 1;
            // Ahora los añadimos en values en el mismo orden que los índices
            values.push(lon, lat, proximidad);
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

// getIncidenciasEliminadas: función para que los gestores puedan ver las incidencias eliminadas desde la más reciente a la más antigua (en fecha de eliminación)
const getIncidenciasEliminadas = async (req, res) => {
    try {
        // Como solo va a ser ordenado por fecha de eliminación de la más reciente a la más antigua y no va a haber filtros, hacemos directamente la consulta
        const result = await pool.query(`SELECT * FROM incidencia WHERE esta_eliminada = true ORDER BY fecha_eliminacion DESC`);
        if (result.rows.length === 0) {
            return res.status(404).send('No se han encontrado incidencias eliminadas');
        }
        
    } catch (error) {
        console.error('Error al cargar las incidencias eliminadas:', error);
        res.status(500).send('Error al cargar las incidencias eliminadas');
    }
};

// getIncidenciasUsuario: función para obtener las incidencias de un usuario --> solo gestores
const getIncidenciasUsuario = async (req, res) => {
    try {
        // Primero necesitamos leer el id del usuario del que queremos obtener las incidencias
        const id = req.params.id;
        // Hacemos la query
        const result = await pool.query(`SELECT incidencia.*, COUNT (voto.id_voto) AS num_votos 
            FROM incidencia 
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
        const infoIncidencia = await pool.query(`SELECT incidencia.*,
            COUNT (voto.id_voto)::int AS num_votos
            FROM incidencia
            LEFT JOIN voto ON voto.incidencia_id = incidencia.id_incidencia
            WHERE incidencia.id_incidencia = $1 AND incidencia.esta_eliminada = false
            GROUP BY incidencia.id_incidencia`, [id]);
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
        const {titulo, descripcion, direccion_texto, lon, lat, categoria} = req.body;
        const usuario_id = req.usuario.id_usuario;
        // Comprobamos que no falta ninguno
        if (!titulo || !direccion_texto || lon === undefined || lat === undefined || !categoria) {
            return res.status(400).send('Faltan campos obligatorios');
        }
        // Comprobamos longitud de texto, que la categoría existe, etc.
        if (titulo.length > 100) {
            return res.status(400).send('El título supera el límite, no debe sobrepasar los 100 caracteres');
        } else if (descripcion.length > 250) {
            return res.status(400).send('La descripción supera el límite, no debe sobrepasar los 250 caracteres');
        } else if (direccion_texto.length > 100) {
            return res.status(400).send('La dirección supera el límite, no debe sobrepasar los 100 caracteres');
        }

        // Comprobamos que el titulo y la descripción no contienen palabras ofensivas
        const tituloNormalizado = pulirYNormalizarTexto(titulo);
        const descripcionNormalizada = pulirYNormalizarTexto(descripcion);
        if (contienePalabrasOfensivas(tituloNormalizado)) {
            return res.status(400).send('El título contiene palabras ofensivas');
        }
        if (contienePalabrasOfensivas(descripcionNormalizada)) {
            return res.status(400).send('La descripción contiene palabras ofensivas');
        }

        // Las coordenadas deben estar en formato válido y estar dentro del rango de coordenadas
        const longitud = Number(lon); // Los convertimos en número y lo dejamos preparado para la la comprobación y la query
        const latitud = Number(lat);
        const latValida = latitud >= -90 && latitud <= 90;
        const lonValida = longitud >= -180 && longitud <= 180;
        const coordsValidas = latValida && lonValida;
        if (isNaN(longitud) || isNaN(latitud)) {
            return res.status(400).send('El formato de las coordenadas no es válido');
        } else if (!coordsValidas) {
            return res.status(400).send('Las coordenadas no son válidas');
        }

        // Comprobamos que la categoría existe
        // La idea es que el usuario seleccione una de un menú desplegable, por lo que viene ya el nombre de la bd y no hace falta normalizarlo
        // No haría falta comprobarlo teniendo en cuenta lo que acabo de poner, pero por si acaso no está de más
        const categValida = await pool.query(`SELECT 1 FROM categoria WHERE nombre = $1`, [categoria]);
        if (categValida.rows.length === 0) {
            return res.status(404).send('La categoría no existe');
        }

        // Definimos los valores iniciales que no vienen dados por el usuario como estado, prioridad, etc.
        //const fecha_creacion = CURRENT_DATE;
        const estado = 'Nueva';
        const prioridad = 1;
        //const validada = false;
        //const esta_eliminada = false;

        // Como usamos PostGIS y en la bd tenemos la ubicación como geography(POINT, 4326), 
        // debemos crear el punto con ST_MakePoint(lon, lat)::geography en la query

        // Realizamos la query de la incidencia
        const nuevaIncidencia = await pool.query(`INSERT INTO incidencia (titulo, descripcion, fecha_creacion, ubicacion, 
            direccion_texto, categoria_nombre, estado_nombre, usuario_id, prioridad, validada, esta_eliminada)
            VALUES ($1, $2, CURRENT_DATE, ST_MakePoint($3, $4)::geography, $5, $6, $7, $8, $9, false, false)
            RETURNING *`, 
            [titulo, descripcion, longitud, latitud, direccion_texto, categoria, estado, usuario_id, prioridad]);

        // Comprobamos si hay imágenes (req.files), y si las hay las añadimos
        const imagenes = req.files;
        let incidencia_id, imagenesSubidas = [];
        if (imagenes && imagenes.length > 0) {
            // Obtenemos el id de la incidencia
            incidencia_id = nuevaIncidencia.rows[0].id_incidencia;
            // Usamos guardarImagenes
            imagenesSubidas = await guardarImagenes(imagenes, usuario_id, incidencia_id);

        }

        // Devolvemos la petición HTTP con la incidncia guardada
        res.status(201).json({
            mensaje: 'Incidencia creada correctamente',
            incidenciaNueva: nuevaIncidencia.rows[0],
            imagenes: imagenesSubidas
        });
        
    } catch (error) {
        console.error('Error al crear nueva incidencia:', error);
        res.status(500).send('Error al crear nueva incidencia');
        
    }
};

// patchEditarIncidencia: función para que un gestor edite una incidencia
// Para esta función contamos con que el frontend envíe solo los campos que se hayan modificado
const patchEditarIncidencia = async (req, res) => {
    // En este caso debemos usar una transacción en sql, de manera que no habrá problemas si, por ejemplo, update funciona pero insert falla
    // De esta forma, si algo falla, no se ejecuta nada y devuelve error
    // Primero obtenemos un cliente del pool de la bd
    const cliente = await pool.connect();
    try {

        // 1. Iniciamos la transacción con BEGIN
        await cliente.query('BEGIN');

        // Leemos el id de la incidencia
        const idIncidencia = req.params.id;
        // Comprobamos que existe
        const existe = await cliente.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [idIncidencia]);
        if (existe.rows.length === 0) {
            await cliente.query('ROLLBACK');
            return res.status(404).send('La incidencia no existe');
        }
        // Comprobamos que no está eliminada
        if (existe.rows[0].esta_eliminada) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('La incidencia está eliminada');
        }
        // Leemos del body los campos
        const datos = req.body; // Como esto es un objeto, necesitamos pasarlo a array para poder comprobar su longitud y ver si está vacío
        if (Object.keys(datos).length === 0) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('Debes modificar al menos un campo');
        }
        // Permitimos solo una serie de campos a modificar, por ejemplo, para que no puedan cambiar la fecha de creación o el id del usuario autor
        const camposPermitidos = ['titulo', 'descripcion', 'categoria', 'estado', 'descripcion_resolucion'];
        for (const campo of Object.keys(datos)) { // Aquí igual tenemos que pasarlo a array para poder comprobar si el campo que hemos recibido se puede modificar
            if (!camposPermitidos.includes(campo)) {
                await cliente.query('ROLLBACK');
                return res.status(400).send('Solo puedes modificar los campos Título, Descripción, Categoría, Estado y Descripción de la resolución');
            }
            // Comprobamos longitudes y palabras ofensivas de los campos recibidos
            // Si es estado, tenemos varias comprobaciones:
            // - Si es validada, tenemos que comprobar que no está ya validada y poner qué gestor la validó. Además solo puede pasar a validada si está en nueva
            // - Si es en proceso, solo puede pasar a ese estado si está en validada.
            // - Si es resuelta, solo puede pasar a ese estado si está en proceso
            if (campo === 'titulo') {
                const tituloNormalizado = pulirYNormalizarTexto(datos[campo]);
                if (contienePalabrasOfensivas(tituloNormalizado)) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('El título contiene palabras ofensivas');
                }
                if (datos[campo].length > 100) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('El límite del título son 100 caracteres');
                }
            }
            if (campo === 'descripcion') {
                const descripcionNormalizada = pulirYNormalizarTexto(datos[campo]);
                if (contienePalabrasOfensivas(descripcionNormalizada)) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('La descripción contiene palabras ofensivas');
                }
                if (datos[campo].length > 250) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('El límite de la descripción son 250 caracteres');
                }
            }
            if (campo === 'descripcion_resolucion') {
                const descripResolNormalizada = pulirYNormalizarTexto(datos[campo]);
                if (contienePalabrasOfensivas(descripResolNormalizada)) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('La descripción de la resolución contiene palabras ofensivas');
                }
                if (datos[campo].length > 250) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('El límite de la descripción de la resolución son 250 caracteres');
                }
            }

        }
        // Montamos y realizamos la query UPDATE una vez hechas todas las comprobaciones
        const update = `UPDATE incidencia`;
        let set = []
        let values = [];
        let where = [];
        let estadoNuevo;
        for (const campo of Object.keys(datos)) {
            if (campo === 'categoria') {
                set.push(`categoria_nombre = $${values.length + 1}`);
                values.push(datos[campo]);
            } else if (campo === 'estado') {
                const estadoActual = existe.rows[0].estado_nombre;
                estadoNuevo = datos[campo];
                if (!esCambioEstadoValido(estadoActual, estadoNuevo)) {
                    await cliente.query('ROLLBACK');
                    return res.status(400).send('Cambio de estado no permitido');
                }
                set.push(`estado_nombre = $${values.length + 1}`);
                values.push(estadoNuevo);

                const camposCambioEstado = obtenerCamposCambioEstado(estadoNuevo, req.usuario.idGestor, datos);
                for (const campo of Object.keys(camposCambioEstado)) {
                    // En este caso lo comprobamos al revés, ya que tenemos más de un campo (para no ser redundantes) que iría con CURRENT_DATE, y así es más rápido
                    if (camposCambioEstado[campo] === 'CURRENT_DATE') {
                        set.push(`${campo} = CURRENT_DATE`);;
                    } else {
                        set.push(`${campo} = $${values.length + 1}`);
                        values.push(camposCambioEstado[campo]);
                    }
                }
            } else {
                set.push(`${campo} = $${values.length + 1}`);
                values.push(datos[campo]);
            }    
        }

        set.push(`fecha_actualizacion = CURRENT_DATE`);
        where.push(`id_incidencia = $${values.length + 1}`);
        values.push(idIncidencia);

        let query = update;
        query += ' SET ' + set.join(', ');
        query += ' WHERE ' + where.join(' AND ');
        query += ' RETURNING *';

        let resultUpdate;
        let resultInsert;

        // 2. Ejecutamos las consultas
        resultUpdate = await cliente.query(query, values);
        // Hacemos el historial del cambio de estado si se modifica el estado
        if (estadoNuevo) {
            resultInsert = await cliente.query(`INSERT INTO cambio_estado (fecha_cambio, incidencia_id, usuario_id, estado_nombre) 
                VALUES (CURRENT_DATE, $1, $2, $3)`, [idIncidencia, req.usuario.id_usuario, estadoNuevo]);
        }
        // 3. Cerramos la transacción si todo sale bien
        await cliente.query('COMMIT');

        res.status(200).json({
            mensaje: 'Incidencia actualizada correctamente',
            resultadoUpdate: resultUpdate.rows,
            // Si no se ha modificado el estado aparecerá null
            resultadoInsert: resultInsert ? resultInsert.rows : null
        });
            
        } catch (error) {
            // 4. Revertimos los cambios si ocurre algún error
            await cliente.query('ROLLBACK');
            console.error('Error al editar la incidencia:', error);
            res.status(500).send('Error al editar la incidencia');
            
        } finally {
            // 5. Liberamos el cliente
            cliente.release();
        }
};

// patchEliminarIncidencia: función para que un gestor elimine una incidencia (borrado lógico)
const patchEliminarIncidencia = async (req, res) => {
    try {
        // Leemos el id de la incidencia que queremos eliminar
        const id = req.params.id;
        // Comprobamos que existe
        const existe = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [id]);
        if (existe.rows.length === 0) {
            return res.status(404).send('La incidencia no existe');
        }
        // Comprobamos que no está ya eliminada
        if (existe.rows[0].esta_eliminada) {
            return res.status(400).send('La incidencia ya está eliminada');
        }
        // Rellenamos los cambios correspondientes y la marcamos como eliminada
        const result = await pool.query(`UPDATE incidencia SET esta_eliminada = true, fecha_eliminacion = CURRENT_DATE, eliminado_por = $1 
            WHERE id_incidencia = $2`, [req.usuario.idGestor, id]);
        res.status(200).send('Incidencia eliminada correctamente');
        
    } catch (error) {
        console.error('Error al eliminar la incidencia:', error);
        res.status(500).send('Error al eliminar la incidencia');
        
    }
};

// patchRecuperarIncidencia: función para que un gestor pueda recuperar una incidencia eliminada
const patchRecuperarIncidencia = async (req, res) => {
    try {
        // Leemos el id de la incidencia a recuperar
        const id = req.params.id;
        // Comprobamos que existe la incidencia
        const existe = await pool.query(`SELECT * FROM incidencia WHERE id_incidencia = $1`, [id]);
        if (existe.rows.length === 0) {
            return res.status(404).send('La incidencia no existe');
        }
        // Comprobamso que está eliminada
        if (!existe.rows[0].esta_eliminada) {
            return res.status(400).send('La incidencia no está eliminada');
        }
        // Reestablecemos los campos correspondientes con UPDATE y la marcamos como no eliminada
        const result = await pool.query(`UPDATE incidencia SET esta_eliminada = false, fecha_eliminacion = null, eliminado_por = null 
            WHERE id_incidencia = $1`, [id]);
        
        res.status(200).send('Se ha recuperado la incidencia correctamente');

    } catch (error) {
        console.error('Error al recuperar la incidencia:', error);
        res.status(500).send('Error al recuperar la incidencia');
        
    }
};

// 3. Exportar
module.exports = {
    // Funciones a exportar
    getIncidencias,
    getIncidenciasUsuario,
    getIncidenciaId,
    getIncidenciasEliminadas,
    postNuevaIncidencia,
    patchEditarIncidencia,
    patchEliminarIncidencia,
    patchRecuperarIncidencia
};