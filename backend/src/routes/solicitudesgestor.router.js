// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const upload = require('../middlewares/uploads.middleware');
const {pulirYNormalizarTexto, contienePalabrasOfensivas} = require('../helpers/texto.helper');
const {guardarImagenes} = require('../helpers/imagenes.helper');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de solicitudes con estado enviada (que no se hayan aceptado ni rechazado)--> solo gestores
router.get('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Hacemos la consulta
        const result = await pool.query(`SELECT * FROM solicitud_gestor WHERE estado = 'Enviada' ORDER BY fecha_solicitud DESC`);
        // Comprobamos que nos devuelve algo
        if (result.rows.length === 0) {
            return res.status(404).send('No se han encontrado solicitudes pendientes');
        }
        // Petición HTTP y resultado
        res.status(200).json({
            mensaje: "Solicitudes pendientes obtenidas correctamente",
            result: result.rows
        });
        
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).send('Error al obtener las solicitudes');
        
    }
});

// GET -> obtener datos de una solicitud específica --> solo gestores o propio usuario
router.get('/:id', auth, usuarioNoBloqueado, autorizarRol (1, 2), async (req, res) => {
    try {
        // Leemos el id de la solicitud sobre la que queremos obtener la información
        const id = req.params.id;
        // Comprobamos que existe la solicitud
        const existe = await pool.query(`SELECT * FROM solicitud_gestor WHERE id_solicitud = $1`, [id]);
        if (existe.rows.length === 0) {
            return res.status(404).send('La solicitud no existe');
        }
        // Obtenemos los datos de la consulta junto con las imágenes
        const result = await pool.query(`SELECT sg.fecha_solicitud, sg.estado, sg.email, sg.nombre, sg.dni, sg.motivo_solicitud, sg.direccion, 
            sg.cp, sg.provincia, sg.localidad, imagen.id_imagen, imagen.ruta FROM solicitud_gestor sg
            LEFT JOIN imagen ON imagen.solicitud_id = sg.id_solicitud AND imagen.esta_eliminada = false WHERE sg.id_solicitud = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('No se han encontrado datos de la solicitud');
        }

        // Como en cada solicitud son obligatorias las 3 imagenes, para no perderlas tenemos que añadirlas al resultado por la forma en la que lo devuelve la bd
        // La forma en que aparece es como si se repitiera 3 veces cada solicitud (una por cada imagen), y lo que queremos es solo tener los datos 1 vez con cada solicitud y sus 3 imagenes
        // Esto se debe al join, que devuelve una fila por cada imagen encontrada
        const filas = result.rows[0];
        const datosSolicitud = {
            fecha_solicitud: filas.fecha_solicitud,
            estado: filas.estado,
            email: filas.email,
            nombre: filas.nombre,
            dni: filas.dni,
            motivo_solicitud: filas.motivo_solicitud,
            direccion: filas.direccion,
            cp: filas.cp,
            provincia: filas.provincia,
            localidad: filas.localidad,
            imagenes: []
        };
        // Recorremos ahora las filas de result buscando las imagenes
        for (const fila of result.rows) {
            datosSolicitud.imagenes.push({
                id_imagen: fila.id_imagen,
                ruta: fila.ruta
            });
        }

        res.status(200).json({
            mensaje: "Datos de la solicitud cargados correctamente",
            datos_solicitud: datosSolicitud
        });
        
    } catch (error) {
        console.error('Error al obtener los datos de la solicitud:', error);
        res.status(500).send('Error al obtener los datos de la solicitud');
        
    }
});

// POST -> crear una nueva solicitud de gestor --> solo usuarios
// El estado se pone automáticamente en Enviada
// código postal exactamente 5 dígitos, dni exactamente 9 caracteres (8 números y 1 letra ó 1 letra + 7 números + 1 letra)
router.post('/', auth, usuarioNoBloqueado, autorizarRol(3), upload.array('imagenes', 3), async (req, res) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        // Leemos del body los datos necesarios para crear la solicitud de gestor
        const {email, nombre, dni, motivo_solicitud, direccion, cp, localidad, provincia, fecha_solicitud} = req.body;
        const imagenes = req.files;
        const id_usuario = req.usuario.id_usuario;
        // Comprobamos que ninguno está vacío
        if (!email || !nombre || !dni || !motivo_solicitud || !direccion || !cp || !localidad || !provincia) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('Faltan campos obligatorios');
        }
        if (!imagenes || imagenes.length !== 3) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('Debes adjuntar las 3 imágenes');
        }
        // Comrpobamos longitudes
        if (motivo_solicitud.length > 250) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El motivo de la solicitud no puede superar los 250 caracteres');
        }
        const motivoNormalizado = pulirYNormalizarTexto(motivo_solicitud);
        if (contienePalabrasOfensivas(motivoNormalizado)) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El motivo de la solicitud de gestor contiene palabras ofensivas');
        }
        // Comprobamos que email y nombre coinciden con los datos del usuario
        const usuario = await cliente.query(`SELECT email, nombre FROM usuario WHERE id_usuario = $1`, [id_usuario]);
        if (email !== usuario.rows[0].email) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El email no coincide con el del perfil');
        }
        if (pulirYNormalizarTexto(nombre) !== pulirYNormalizarTexto(usuario.rows[0].nombre)) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El nombre no coincide con el del perfil');
        }
        // Comprobación de cp y dni
        const regexCP = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
        if (!regexCP.test(cp)) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El código postal debe tener el formato correcto');
        }
        const regexDNI = /^\d{8}[A-Za-z]$/;
        const regexNIE = /^[XYZ]\d{7}[A-Za-z]$/;
        if (!regexDNI.test(dni) && !regexNIE.test(dni)) {
            await cliente.query('ROLLBACK');
            return res.status(400).send('El DNI/NIE no tiene formato válido')
        }

        // Comprobamos que el usuario no tiene una solicitud ya en enviada, ni que tenga una solicitud rechazada con menos de 30 días
        const tieneSolicitud = await cliente.query(`SELECT * FROM solicitud_gestor WHERE usuario_id = $1 ORDER BY fecha_solicitud DESC LIMIT 1`, [id_usuario]);
        if (tieneSolicitud.rows.length !== 0 && tieneSolicitud.rows[0].estado === 'Enviada') {
            await cliente.query('ROLLBACK');
            return res.status(400).send('Ya tienes una solicitud enviada');
        } else if (tieneSolicitud.rows.length !== 0 && tieneSolicitud.rows[0].estado === 'Rechazada') {
            const fecha_resolucion = new Date(tieneSolicitud.rows[0].fecha_resolucion);
            const fecha_actual = new Date();

            const diferencia = (fecha_actual - fecha_resolucion) / (1000 * 60 * 60 * 24); // Restamos las dos fechas y lo convertimos de ms a días

            if (diferencia < 30) {
                await cliente.query('ROLLBACK');
                return res.status(400).send('Debes esperar 30 días para volver a mandar una solicitud');
            }
        }
        // Hacemos la transacción con la consulta INSERT INTO en solicitud_gestor con estado = Enviada y guardamos las imagenes
        const solicitud = await cliente.query(`INSERT INTO solicitud_gestor (email, nombre, dni, motivo_solicitud, direccion, cp, localidad, provincia, fecha_solicitud, estado, usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10) RETURNING *`, [email, nombre, dni, motivo_solicitud, direccion, cp, localidad, provincia, 'Enviada', id_usuario]);
        
        const imagenesGuardadas = await guardarImagenes(imagenes, id_usuario, null, null, solicitud.rows[0].id_solicitud);

        await cliente.query('COMMIT');

        res.status(201).json({
            mensaje: "Solicitud enviada correctamente",
            solicitudNueva: solicitud.rows[0],
            imagenes: imagenesGuardadas
        });
        
    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error al crear la solicitud de gestor:', error);
        res.status(500).send('Error al crear la solicitud de gestor');
        
    } finally {
        cliente.release();
        
    }
});

// PATCH -> rechazar una solicitud --> solo gestores
// El estado pasa a rechazada, y se rellena el id del gestor y la fecha de la resolución
router.patch('/:id/rechazar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Leemos el id de la solicitud a rechazar
        const id = req.params.id;
        // Comprobamos que existe al solicitud
        const existe = await pool.query(`SELECT * FROM solicitud_gestor WHERE id_solicitud = $1`, [id]);
        if (existe.rows.length === 0) {
            return res.status(404).send('No existe la solicitud');
        }
        // Comprobamos que no está ya rechazada o aceptada
        if (existe.rows[0].estado === 'Rechazada') {
            return res.status(400).send('La solicitud ya ha sido rechazada');
        }
        if (existe.rows[0].estado === 'Aceptada') {
            return res.status(400).send('La solicitud ya ha sido aceptada');
        }
        // Marcamos estado = Rechazada y rellenamos los campos correspondientes
        const result = await pool.query(`UPDATE solicitud_gestor SET estado = 'Rechazada', fecha_resolucion = CURRENT_DATE, 
            gestor_id = $1 WHERE id_solicitud = $2`, [req.usuario.idGestor, id]);

        res.status(200).send('Solicitud rechazada correctamente');
        
    } catch (error) {
        console.error('Error al rechazar la solicitud:', error);
        res.status(500).send('Error al rechazar la solicitud');
        
    }
});

// PATCH -> acepta una solicitud --> solo gestores
// El estado pasa a aceptada y se rellenen el id del gestor y al fecha de la resolución
// Esto conecta con el post /usuarios/gestores en frontend
router.patch('/:id/aceptar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
   try {
    // Leemos el id de la solicitud a rechazar
    const id = req.params.id;
    // Comprobamos que existe al solicitud
    const existe = await pool.query(`SELECT * FROM solicitud_gestor WHERE id_solicitud = $1`, [id]);
    if (existe.rows.length === 0) {
        return res.status(404).send('No existe la solicitud');
    }
    // Comprobamos que no está ya rechazada o aceptada
    if (existe.rows[0].estado === 'Rechazada') {
        return res.status(400).send('La solicitud ya ha sido rechazada');
    }
    if (existe.rows[0].estado === 'Aceptada') {
        return res.status(400).send('La solicitud ya ha sido aceptada');
    }
    // Marcamos estado = Aceptada y rellenamos los campos correspondientes
    const result = await pool.query(`UPDATE solicitud_gestor SET estado = 'Aceptada', fecha_resolucion = CURRENT_DATE, 
        gestor_id = $1 WHERE id_solicitud = $2`, [req.usuario.idGestor, id]);

    res.status(200).send('Solicitud aceptada correctamente');
    
   } catch (error) {
    console.error('Error al aceptar la solicitud:', error);
    res.status(500).send('Error al aceptar la solicitud');

   } 
});

// 4. Exportar router
module.exports = router;