// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const upload = require('../middlewares/uploads.middleware');

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
// Comprobar que email y nombre coincide con los datos del perfil del usuario
// Comprobar que hay exactamente 3 imagenes (frontal y trasera del dni, y una foto de la cara)
// código postal exactamente 5 dígitos, dni exactamente 9 caracteres
// comprobar que cp, dirección, provincia y localidad existen
router.post('/', auth, usuarioNoBloqueado, autorizarRol(3), upload.array('imagenes', 3), async (req, res) => {
    try {
        
    } catch (error) {
        
    }
});

// PATCH -> rechazar una solicitud --> solo gestores
// El estado pasa a rechazada, y se rellena el id del gestor y la fecha de la resolución
router.patch('/:id/rechazar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        
    } catch (error) {
        
    }
});

// PATCH -> acepta una solicitud --> solo gestores
// El estado pasa a aceptada y se rellenen el id del gestor y al fecha de la resolución
// Esto conecta con el post /usuarios/gestores
router.patch('/:id/aceptar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
   try {
    
   } catch (error) {
    
   } 
});

// 4. Exportar router
module.exports = router;